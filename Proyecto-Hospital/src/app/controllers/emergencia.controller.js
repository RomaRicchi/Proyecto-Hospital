import {
  Paciente,
  Familiar,
  Admision,
  ObraSocial,
  MotivoIngreso,
  Cama,
  Habitacion,
  Sector,
  Turno,
  Movimiento,
  MovimientoHabitacion,
  RegistroHistoriaClinica,
  TipoRegistro
} from '../models/index.js';
import { Op } from 'sequelize';
import { verificarGeneroHabitacion } from '../validators/admision.validator.js';
import {
  validarEstadoCama,
  validarFechaNoPasada,
  validarAdmisionActiva,
  validarConflictoReserva,
} from '../validators/admision.validator.js';

export const vistaEmergencias = (req, res) => {
  try {
    res.render('emergencia', {
      usuario: req.session.usuario,
      autenticado: true
    });
  } catch (error) {
    res.status(500).send('Error al cargar la vista de emergencias');
  }
};

export const ingresoEmergencia = async (req, res) => {
  const sequelize = Admision.sequelize;
  const t = await sequelize.transaction();
  try {
    const { fecha_hora_ingreso, sexo, identificador, id_usuario, tipo_emergencia } = req.body;

    if (!fecha_hora_ingreso || !sexo || !identificador || !tipo_emergencia) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const fechaLocal = new Date(fecha_hora_ingreso);
    await validarFechaNoPasada(fechaLocal);

    let paciente = await Paciente.findOne({
      where: { dni_paciente: identificador },
      transaction: t,
    });

    if (paciente) {
      await t.rollback();
      return res.status(409).json({ error: 'El paciente ya existe en el sistema.' });
    }

    paciente = await Paciente.create({
      dni_paciente: identificador,
      apellido_p: 'NN',
      nombre_p: 'No identificado',
      fecha_nac: null,
      id_genero: sexo,
      telefono: null,
      direccion: null,
      id_localidad: null,
      email: null,
      estado: 1,
    }, { transaction: t });

    await validarAdmisionActiva(paciente.id_paciente, fechaLocal, t);

    const obraSocial = await ObraSocial.findOne({
      where: { nombre: { [Op.like]: '%Sin obra social%' } },
      transaction: t,
    });
    if (!obraSocial) {
      await t.rollback();
      return res.status(400).json({ error: 'No se encontró "Sin obra social".' });
    }

    const motivo = await MotivoIngreso.findOne({
      where: { tipo: { [Op.like]: '%emergencia%' } },
      transaction: t,
    });
    if (!motivo) {
      await t.rollback();
      return res.status(400).json({ error: 'No se encontró el motivo "emergencia".' });
    }
    const tipoEmergenciaLower = tipo_emergencia.toLowerCase();

    if (!['niño', 'adulto'].includes(tipoEmergenciaLower)) {
      await t.rollback();
      return res.status(400).json({ error: 'Tipo de emergencia no válido.' });
    }

    const sectorDestino = tipoEmergenciaLower === 'niño'
      ? 'Internación pediatrica'
      : 'Terapia intermedia';

    const camasLibres = await Cama.findAll({
      where: { estado: 0, desinfeccion: true },
      include: [
        {
          model: Habitacion,
          as: 'habitacion',
          required: true,
          include: [
            {
              model: Sector,
              as: 'sector',
              where: {
                nombre: { [Op.like]: `%${sectorDestino}%` }
              }
            }
          ]
        }
      ],
      transaction: t,
    });

    let camaAsignada = null;

    for (const cama of camasLibres) {
      try {
        await verificarGeneroHabitacion(cama.id_habitacion, sexo, t);
        camaAsignada = cama;
        break;
      } catch (err) {
        // cama incompatible, seguir buscando
      }
    }

    if (!camaAsignada) {
      await t.rollback();
      return res.status(409).json({
        error: 'No hay camas disponibles compatibles con el sexo y sector del paciente.',
      });
    }

    await validarEstadoCama(camaAsignada.id_cama, t);
    await validarConflictoReserva({ id_cama: camaAsignada.id_cama, fecha_hora_ingreso: fechaLocal }, t);

    const admision = await Admision.create({
      id_paciente: paciente.id_paciente,
      id_obra_social: obraSocial.id_obra_social,
      num_asociado: identificador,
      fecha_hora_ingreso: fechaLocal,
      id_motivo: motivo.id_motivo,
      descripcion: 'Ingreso por emergencia',
      fecha_hora_egreso: null,
      motivo_egr: null,
      id_usuario: id_usuario || null,
    }, { transaction: t });

    const movIngreso = await Movimiento.findOne({
      where: { nombre: { [Op.like]: '%Ingresa%' } },
      transaction: t,
    });

    await MovimientoHabitacion.create({
      id_admision: admision.id_admision,
      id_habitacion: camaAsignada.id_habitacion,
      id_cama: camaAsignada.id_cama,
      fecha_hora_ingreso: fechaLocal,
      fecha_hora_egreso: null,
      id_mov: movIngreso ? movIngreso.id_mov : 1,
      estado: 1,
    }, { transaction: t });

    await camaAsignada.update({ estado: 1 }, { transaction: t });

    const tipoIngreso = await TipoRegistro.findOne({
      where: { nombre: { [Op.like]: '%ingreso%' } },
      transaction: t,
    });

    if (tipoIngreso) {
      await RegistroHistoriaClinica.create({
        id_admision: admision.id_admision,
        id_usuario: id_usuario || null,
        fecha_hora_reg: fechaLocal,
        id_tipo: tipoIngreso.id_tipo,
        detalle: 'Ingreso por emergencia.',
        estado: 1,
      }, { transaction: t });
    }

    await t.commit();

    return res.status(200).json({
      mensaje: 'Paciente ingresado y cama asignada correctamente.',
      paciente: {
        id: paciente.id_paciente,
        nombre: paciente.nombre_p,
        apellido: paciente.apellido_p,
        dni: paciente.dni_paciente,
      },
      habitacion: camaAsignada.id_habitacion,
      num_habitacion: camaAsignada.habitacion.num,
      cama: camaAsignada.nombre,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error('❌ Error en ingreso de emergencia:', error);
    return res.status(500).json({ error: 'Error en el ingreso de emergencia.' });
  }
};

export const actualizarPacienteEmergencia = async (req, res) => {
  const {
    dni_emergencia, dni, nombre, apellido, fecha_nac,
    telefono, direccion, id_localidad, email, id_genero
  } = req.body;

  const t = await Paciente.sequelize.transaction();
  try {
    const pacienteNN = await Paciente.findOne({
      where: {
        dni_paciente: dni_emergencia,
        apellido_p: 'NN',
        nombre_p: 'No identificado',
        estado: 1
      },
      transaction: t
    });

    if (!pacienteNN) {
      await t.rollback();
      return res.status(404).json({ error: 'Paciente NN no encontrado' });
    }

    const pacienteReal = await Paciente.findOne({
      where: { dni_paciente: dni },
      transaction: t
    });

    if (pacienteReal) {
      await Admision.update({ id_paciente: pacienteReal.id_paciente }, {
        where: { id_paciente: pacienteNN.id_paciente },
        transaction: t
      });

      await Turno.update({ id_paciente: pacienteReal.id_paciente }, {
        where: { id_paciente: pacienteNN.id_paciente },
        transaction: t
      });

      await Familiar.update({ id_paciente: pacienteReal.id_paciente }, {
        where: { id_paciente: pacienteNN.id_paciente },
        transaction: t
      });

      await pacienteNN.update({ estado: 0 }, { transaction: t });

      await t.commit();
      return res.json({ mensaje: 'Paciente fusionado correctamente con el registro existente.' });
    }

    await pacienteNN.update({
      dni_paciente: dni,
      nombre_p: nombre,
      apellido_p: apellido,
      fecha_nac: fecha_nac || null,
      telefono: telefono || null,
      direccion: direccion || null,
      id_localidad: id_localidad || null,
      email: email || null,
      id_genero
    }, { transaction: t });

    await t.commit();
    return res.json({ mensaje: 'Datos del paciente NN actualizados correctamente.' });

  } catch (error) {
    console.error('❌ Error al actualizar paciente NN:', error);
    await t.rollback();
    return res.status(500).json({ error: 'Error al actualizar los datos del paciente.' });
  }
};

