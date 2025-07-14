import {
  MovimientoHabitacion,
  Admision,
  Paciente,
  Cama,
  Habitacion,
  Sector,
  TipoRegistro,
  RegistroHistoriaClinica,
  sequelize,
} from '../models/index.js';
import { Op } from 'sequelize';
import { toUTC } from '../helpers/timezone.helper.js'; 
import {
  verificarGeneroHabitacion,
} from '../validators/admision.validator.js';
import {
  calcularEdad,
  validarCompatibilidadPacienteSector
} from '../validators/validarSectorPaciente.js';

export const vistaReservarCama = (req, res) => {
  try {
    res.render('reservaCama'); // no necesita camas
  } catch (error) {
    res.status(500).send('Error al cargar reservas');
  }
};

export const confirmarReserva = async (req, res) => {
  const { id_movimiento } = req.params;
  const t = await sequelize.transaction();

  try {
    const movimiento = await MovimientoHabitacion.findByPk(id_movimiento, {
      include: [
        {
          model: Admision,
          as: 'admision',
          include: [{ model: Paciente, as: 'paciente' }]
        },
        {
          model: Habitacion,
          as: 'habitacion',
          include: [{ model: Sector, as: 'sector' }]
        },
        { model: Cama, as: 'cama' }
      ],
      transaction: t
    });

    if (!movimiento) {
      await t.rollback();
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    // Validar que solo se pueda confirmar el día correspondiente (en horario argentino)
    const ahoraArg = new Date();
    const hoy = ahoraArg.toISOString().split('T')[0];

    const reservaArg = new Date(movimiento.fecha_hora_ingreso);
    const fechaReserva = reservaArg.toISOString().split('T')[0];

    if (fechaReserva !== hoy) {
      await t.rollback();
      return res.status(400).json({ message: 'Solo se puede confirmar la reserva el día de inicio.' });
    }

    const paciente = movimiento.admision.paciente;
    const cama = movimiento.cama;
    const habitacion = movimiento.habitacion;
    const sector = habitacion?.sector?.nombre || '';
    const genero = paciente.id_genero;
    const edad = calcularEdad(paciente.fecha_nac);

    // Validación de género
    await verificarGeneroHabitacion(habitacion.id_habitacion, genero, t);

    // Validación de compatibilidad por sector
    const compatible = validarCompatibilidadPacienteSector(edad, genero, sector);
    if (!compatible) {
      await t.rollback();
      return res.status(409).json({ message: `El paciente no cumple los requisitos del sector "${sector}".` });
    }

    // Actualizar movimiento a ingreso
    movimiento.id_mov = 1;
    movimiento.fecha_hora_ingreso = movimiento.fecha_hora_ingreso;
    movimiento.estado = 1;
    await movimiento.save({ transaction: t });

    // Actualizar cama
    cama.estado = 1;
    await cama.save({ transaction: t });

    // Crear registro clínico
    const tipoIngreso = await TipoRegistro.findOne({
      where: { nombre: { [Op.like]: '%ingreso%' } }
    });

    if (tipoIngreso) {
      await RegistroHistoriaClinica.create({
        id_admision: movimiento.id_admision,
        id_usuario: movimiento.admision.id_usuario || null,
        fecha_hora_reg: movimiento.fecha_hora_ingreso,
        id_tipo: tipoIngreso.id_tipo,
        detalle: 'Confirmación de ingreso por reserva',
        estado: 1
      }, { transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: 'Reserva confirmada como ingreso' });

  } catch (error) {
    console.error('❌ Error en confirmarReserva:', error);
    if (t) await t.rollback();
    res.status(500).json({ message: error.message || 'Error interno' });
  }
};

export const cancelarReserva = async (req, res) => {
  const { id_movimiento } = req.params;
  try {
    const movimiento = await MovimientoHabitacion.findByPk(id_movimiento, {
      include: [{ model: Admision, as: 'admision' }]
    });

    if (!movimiento) {
      return res.status(404).send('Reserva no encontrada');
    }

    if (movimiento.id_mov !== 3) {
      return res.status(400).send('Solo se pueden cancelar reservas');
    }

    const idAdmision = movimiento.id_admision;
    await movimiento.destroy();

    const movimientosRestantes = await MovimientoHabitacion.findAll({
      where: { id_admision: idAdmision },
    });

    if (movimientosRestantes.length === 0) {
      await Admision.destroy({ where: { id_admision: idAdmision } });
    }

    res.json({ message: 'Reserva cancelada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar la reserva' });
  }
};

export const eliminarReservasVencidas = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Día actual en Argentina (inicio del día)
    const ahoraArgentina = new Date();
    const fechaHoyArgentina = new Date(
      ahoraArgentina.getFullYear(),
      ahoraArgentina.getMonth(),
      ahoraArgentina.getDate(),
      0, 0, 0
    );

    const hoyUTC = toUTC(fechaHoyArgentina);

    const reservasVencidas = await MovimientoHabitacion.findAll({
      where: {
        id_mov: 3, // tipo reserva
        fecha_hora_ingreso: { [Op.lt]: hoyUTC },
      },
      transaction: t
    });

    for (const mov of reservasVencidas) {
      const idAdmision = mov.id_admision;
      await mov.destroy({ transaction: t });

      const otrosMov = await MovimientoHabitacion.findAll({
        where: { id_admision: idAdmision },
        transaction: t
      });

      if (otrosMov.length === 0) {
        await Admision.destroy({ where: { id_admision: idAdmision }, transaction: t });
      }
    }

    await t.commit();
    res.json({ message: `Reservas vencidas eliminadas: ${reservasVencidas.length}` });
  } catch (error) {
    if (t) await t.rollback();
    console.error('❌ Error eliminando reservas vencidas:', error);
    res.status(500).json({ message: 'Error al eliminar reservas vencidas' });
  }
};

