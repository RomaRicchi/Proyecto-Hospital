import {
  MovimientoHabitacion,
  Admision,
  Paciente,
  Cama,
  Habitacion,
  Sector,
  TipoRegistro,
  RegistroHistoriaClinica
} from '../models/index.js';
import { Op } from 'sequelize';
import { toUTC, ajustarFechaLocal } from '../helpers/timezone.helper.js'; 
import {
  verificarGeneroHabitacion,
} from '../validators/admision.validator.js';
import {
  calcularEdad,
  validarCompatibilidadPacienteSector
} from '../validators/validarSectorPaciente.js';

export const vistaReservarCama = async (req, res) => {
  try {
    const nowUTC = toUTC(new Date());

    const camas = await Cama.findAll({
      include: [
        {
          model: Habitacion,
          as: 'habitacion',
          include: [{ model: Sector, as: 'sector' }]
        },
        {
          model: MovimientoHabitacion,
          as: 'movimientos',
          where: {
            id_mov: 3,
            fecha_hora_ingreso: { [Op.gt]: nowUTC },
            estado: 1
          },
          required: false,
          include: [
            {
              model: Admision,
              as: 'admision',
              include: [
                { model: Paciente, as: 'paciente' },
                { model: MotivoIngreso, as: 'motivo_ingreso' }
              ]
            }
          ]
        }
      ],
      order: [['id_cama', 'ASC']]
    });

    res.render('reservaCama', { camas });
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
    movimiento.fecha_hora_ingreso = ajustarFechaLocal(movimiento.fecha_hora_ingreso);
    movimiento.estado = 1;
    await movimiento.save({ transaction: t });

    // Actualizar cama
    cama.estado = 1;
    await cama.save({ transaction: t });

    // Crear registro clínico
    const tipoIngreso = await TipoRegistro.findOne({
      where: { nombre: { [sequelize.Op.iLike]: '%ingreso%' } }
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
    if (t) await t.rollback();
    res.status(500).json({ message: error.message });
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
