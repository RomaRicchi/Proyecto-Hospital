import {
	Usuario,
	PersonalAdministrativo,
	PersonalSalud,
	RolUsuario,
	Especialidad,
} from '../models/index.js';
import bcrypt from 'bcrypt';

export const getUsuarios = async (req, res) => {
	try {
		const usuarios = await Usuario.findAll({
			include: [
				{
					model: PersonalAdministrativo,
					as: 'personal_administrativo',
					include: [{ model: RolUsuario, as: 'rol', attributes: ['nombre'] }],
				},
				{
					model: PersonalSalud,
					as: 'datos_medico',
					include: [
						{ model: RolUsuario, as: 'rol', attributes: ['nombre'] },
						{ model: Especialidad, as: 'especialidad', attributes: ['nombre'] },
					],
				},
			],
		});

		const adaptados = usuarios.map((u) => {
			const admin = u.personal_administrativo;
			const salud = u.datos_medico;
			return {
				id_usuario: u.id_usuario,
				username: u.username,
				estado: u.estado ? 'Activo' : 'Inactivo',
				tipo: admin ? 'Administrativo' : salud ? 'Salud' : '-',
				rol: admin?.rol?.nombre || salud?.rol?.nombre || '-',
				especialidad: salud?.especialidad?.nombre || (admin ? 'N/A' : '-'),
			};
		});

		res.json(adaptados);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener usuarios' });
	}
};

export const vistaUsuarios = async (req, res) => {
	try {
		const usuarios = await Usuario.findAll({
			include: [
				{
					model: PersonalAdministrativo,
					as: 'personal_administrativo',
					include: [{ model: RolUsuario, as: 'rol', attributes: ['nombre'] }],
				},
				{
					model: PersonalSalud,
					as: 'datos_medico',
					include: [
						{ model: RolUsuario, as: 'rol', attributes: ['nombre'] },
						{ model: Especialidad, as: 'especialidad', attributes: ['nombre'] },
					],
				},
			],
		});

		const usuariosAdaptados = usuarios.map((u) => {
			const admin = u.personal_administrativo;
			const salud = u.datos_medico;
			return {
				id_usuario: u.id_usuario,
				username: u.username,
				estado: u.estado ? 'Activo' : 'Inactivo',
				tipo: admin ? 'Administrativo' : salud ? 'Salud' : '-',
				rol: admin?.rol?.nombre || salud?.rol?.nombre || '-',
				especialidad: salud?.especialidad?.nombre || (admin ? 'N/A' : '-'),
			};
		});

		res.render('usuario', { usuarios: usuariosAdaptados });
	} catch (error) {
		res.status(500).send('Error al mostrar usuarios');
	}
};

export const getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [
        {
          model: PersonalSalud,
          as: 'datos_medico',
          attributes: ['apellido', 'nombre', 'id_rol_usuario', 'id_especialidad', 'matricula'],
        },
        {
          model: PersonalAdministrativo,
          as: 'personal_administrativo',
          attributes: ['apellido', 'nombre', 'id_rol_usuario'],
        },
      ],
    });

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const datos = usuario.datos_medico || usuario.personal_administrativo || {};

    res.json({
      username: usuario.username,
      estado: usuario.estado ? 'Activo' : 'Inactivo',
      id_rol_usuario: datos.id_rol_usuario || usuario.id_rol_usuario,
      id_especialidad: datos.id_especialidad || null,
      matricula: datos.matricula || '',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUsuario = async (req, res) => {
	try {
		const {
			username,
			password,
			apellido,
			nombre,
			id_rol_usuario,
			id_especialidad,
			matricula,
		} = req.body;

		if (!username || !password || !apellido || !nombre || !id_rol_usuario) {
			return res.status(400).json({ message: 'Faltan datos requeridos' });
		}

		// Validación: usuario único
		const existente = await Usuario.findOne({ where: { username } });
		if (existente) {
			return res.status(409).json({ message: 'El usuario ya existe' });
		}

		// Validación: contraseña mínima
		if (password.length < 5) {
			return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const nuevoUsuario = await Usuario.create({
			username,
			password: hashedPassword,
			id_rol_usuario,
			estado: true,
		});

		let nuevoPersonal;

		if ([3, 4].includes(parseInt(id_rol_usuario))) {
			nuevoPersonal = await PersonalSalud.create({
				id_usuario: nuevoUsuario.id_usuario,
				apellido,
				nombre,
				id_rol_usuario,
				id_especialidad: id_especialidad || null,
				matricula: matricula || null,
				activo: true,
			});
		} else {
			nuevoPersonal = await PersonalAdministrativo.create({
				id_usuario: nuevoUsuario.id_usuario,
				apellido,
				nombre,
				id_rol_usuario,
				activo: true,
			});
		}

		res.status(201).json({
			message: 'Usuario creado con éxito',
			usuario: {
				id: nuevoUsuario.id_usuario,
				username: nuevoUsuario.username,
			},
			personal: {
				id: nuevoPersonal.id_personal_salud || nuevoPersonal.id_personal_admin,
				nombre: nuevoPersonal.nombre,
				apellido: nuevoPersonal.apellido,
			},
		});
	} catch (error) {
		res.status(500).json({ message: 'Error al registrar el usuario' });
	}
};

export const updateUsuario = async (req, res) => {
	try {
		const {
			username,
			password,
			id_rol_usuario,
			apellido,
			nombre,
			id_especialidad,
			matricula,
			estado,
		} = req.body;

		const usuario = await Usuario.findByPk(req.params.id);
		if (!usuario)
			return res.status(404).json({ message: 'Usuario no encontrado' });

		if (username) usuario.username = username;
		if (password) usuario.password = await bcrypt.hash(password, 10);
		if (id_rol_usuario) usuario.id_rol_usuario = id_rol_usuario;
		if (typeof estado === 'boolean') usuario.estado = estado;

		await usuario.save();

		const personalSalud = await PersonalSalud.findOne({ where: { id_usuario: usuario.id_usuario } });
		const personalAdmin = await PersonalAdministrativo.findOne({ where: { id_usuario: usuario.id_usuario } });

		if ([3, 4].includes(parseInt(id_rol_usuario))) {
			if (!personalSalud) {
				if (personalAdmin) await personalAdmin.destroy();
				await PersonalSalud.create({
					id_usuario: usuario.id_usuario,
					apellido,
					nombre,
					id_rol_usuario,
					id_especialidad: id_especialidad || null,
					matricula: matricula || null,
					activo: true,
				});
			} else {
				await personalSalud.update({
					apellido,
					nombre,
					id_rol_usuario,
					id_especialidad: id_especialidad || null,
					matricula: matricula || null,
				});
			}
		} else {
			if (!personalAdmin) {
				if (personalSalud) await personalSalud.destroy();
				await PersonalAdministrativo.create({
					id_usuario: usuario.id_usuario,
					apellido,
					nombre,
					id_rol_usuario,
					activo: true,
				});
			} else {
				await personalAdmin.update({
					apellido,
					nombre,
					id_rol_usuario,
				});
			}
		}

		res.json({ message: 'Usuario actualizado correctamente' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteUsuario = async (req, res) => {
	try {
		const usuario = await Usuario.findByPk(req.params.id);
		if (!usuario)
			return res.status(404).json({ message: 'Usuario no encontrado' });

		usuario.estado = false;
		await usuario.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const listarUsuariosMedicos = async (req, res) => {
	try {
		const medicos = await Usuario.findAll({
			attributes: ['id_usuario', 'username'],
			include: {
				model: PersonalSalud,
				as: 'datos_medico',
				where: {
					id_rol_usuario: 4,
					activo: true,
				},
				attributes: ['id_personal_salud', 'nombre', 'apellido', 'matricula'],
				include: {
					model: Especialidad,
					as: 'especialidad',
					attributes: ['nombre'],
				},
			},
		});

		const resultado = medicos.map((m) => ({
			id_usuario: m.id_usuario,
			id_personal_salud: m.datos_medico.id_personal_salud,
			nombre: m.datos_medico.nombre,
			apellido: m.datos_medico.apellido,
			matricula: m.datos_medico.matricula,
			especialidad: m.datos_medico.especialidad?.nombre || '',
		}));

		res.json(resultado);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener médicos' });
	}
};
