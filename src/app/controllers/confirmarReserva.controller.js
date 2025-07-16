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
import {  verificarGeneroHabitacion,
} from '../validators/admision.validator.js';
import {
  calcularEdad,
  validarCompatibilidadPacienteSector
} from '../validators/validarSectorPaciente.js';

export const vistaReservarCama = (req, res) => {
  try {
    res.render('reservaCama'); 
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

    const ahora = new Date();
    const hoyLocal = ahora.toLocaleDateString('sv-SE'); // "YYYY-MM-DD"
    const fechaReserva = new Date(movimiento.fecha_hora_ingreso).toLocaleDateString('sv-SE');

    if (fechaReserva !== hoyLocal) {
      await t.rollback();
      return res.status(400).json({ message: 'Solo se puede confirmar la reserva el día de inicio.' });
    }

    const paciente = movimiento.admision.paciente;
    const cama = movimiento.cama;
    const habitacion = movimiento.habitacion;
    const sector = habitacion?.sector?.nombre || '';
    const genero = paciente.id_genero;
    const edad = calcularEdad(paciente.fecha_nac);

    await verificarGeneroHabitacion(habitacion.id_habitacion, genero, t);

    const compatible = validarCompatibilidadPacienteSector(edad, genero, sector);
    if (!compatible) {
      await t.rollback();
      return res.status(409).json({
        message: `El paciente no cumple los requisitos del sector "${sector}".`
      });
    }

    movimiento.id_mov = 1; // cambio a "ingreso"
    movimiento.fecha_hora_ingreso = movimiento.fecha_hora_ingreso;
    movimiento.estado = 1;
    await movimiento.save({ transaction: t });

    cama.estado = 1;
    await cama.save({ transaction: t });

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

export const updateReserva = async (req, res) => {
  const { id_movimiento } = req.params;
  const { nueva_fecha_hora } = req.body;
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
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (movimiento.id_mov !== 3) {
      await t.rollback();
      return res.status(400).json({ message: 'Solo se pueden modificar reservas' });
    }

    const fechaReserva = new Date(nueva_fecha_hora);
    const ahora = new Date();
    if (isNaN(fechaReserva.getTime()) || fechaReserva < ahora) {
      await t.rollback();
      return res.status(400).json({ message: 'La nueva fecha debe ser futura' });
    }

    // Validar compatibilidad de habitación y sector
    const paciente = movimiento.admision.paciente;
    const habitacion = movimiento.habitacion;
    const sector = habitacion?.sector?.nombre || '';
    const genero = paciente.id_genero;
    const edad = calcularEdad(paciente.fecha_nac);

    await verificarGeneroHabitacion(habitacion.id_habitacion, genero, t);

    const compatible = validarCompatibilidadPacienteSector(edad, genero, sector);
    if (!compatible) {
      await t.rollback();
      return res.status(409).json({
        message: `El paciente no cumple los requisitos del sector "${sector}".`
      });
    }

    movimiento.fecha_hora_ingreso = fechaReserva;
    await movimiento.save({ transaction: t });

    await t.commit();
    return res.json({ message: 'Reserva actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar reserva:', error);
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
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (movimiento.id_mov !== 3) {
      return res.status(400).json({ message: 'Solo se pueden cancelar reservas' });
    }

    const idAdmision = movimiento.id_admision;

    // Eliminar la reserva
    await movimiento.destroy();

    // Buscar si quedan más movimientos para esa admisión
    const movimientosRestantes = await MovimientoHabitacion.count({
      where: { id_admision: idAdmision }
    });

    // Si no hay ninguno más, eliminar la admisión
    if (movimientosRestantes === 0) {
      await Admision.destroy({ where: { id_admision: idAdmision } });
    }

    res.json({ message: 'Reserva cancelada correctamente' });

  } catch (error) {
    console.error('❌ Error en cancelarReserva:', error);
    res.status(500).json({ message: 'Error al cancelar la reserva' });
  }
};

export const eliminarReservasVencidas = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Calcular la fecha de ayer en formato YYYY-MM-DD
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const fechaAyer = ayer.toISOString().split('T')[0];

    // Obtener todas las reservas cuya fecha de ingreso fue AYER (hora local)
    const reservasVencidas = await MovimientoHabitacion.findAll({
      where: {
        id_mov: 3, // tipo reserva
        fecha_hora_ingreso: {
          [Op.gte]: new Date(`${fechaAyer}T00:00:00`),
          [Op.lt]: new Date(`${fechaAyer}T23:59:59`)
        }
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
