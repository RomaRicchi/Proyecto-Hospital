import {
	Usuario,
	PersonalAdministrativo,
	PersonalSalud,
	RolUsuario,
	Especialidad,
} from '../models/index.js';
import bcrypt from 'bcrypt';

// 🔸 Obtener todos los usuarios con relaciones (API REST)
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
					as: 'datos_medico', // 👈 Este alias es el que definiste en index.js
					include: [
						{ model: RolUsuario, as: 'rol', attributes: ['nombre'] },
						{ model: Especialidad, as: 'especialidad', attributes: ['nombre'] },
					],
				},
			],
		});

		const adaptados = usuarios.map((u) => {
			const admin = u.personal_administrativo;
			const salud = u.personal_salud;
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

// 🔸 Vista adaptada para la tabla DataTable de PUG
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
					as: 'datos_medico', // 👈 Este alias es el que definiste en index.js
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

// 📥 Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
	try {
		const usuario = await Usuario.findByPk(req.params.id);
		if (!usuario)
			return res.status(404).json({ message: 'Usuario no encontrado' });
		res.json(usuario);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// ➕ Crear usuario nuevo (API REST)
export const createUsuario = async (req, res) => {
	try {
		const { username, password, apellido, nombre, id_rol_usuario } = req.body;

		if (!username || !password || !apellido || !nombre || !id_rol_usuario) {
			return res.status(400).json({ message: 'Faltan datos requeridos' });
		}

		const existente = await Usuario.findOne({ where: { username } });
		if (existente) {
			return res.status(409).json({ message: 'El usuario ya existe' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const nuevoUsuario = await Usuario.create({
			username,
			password: hashedPassword,
			estado: true,
		});

		const nuevoPersonal = await PersonalAdministrativo.create({
			id_usuario: nuevoUsuario.id_usuario,
			apellido,
			nombre,
			id_rol_usuario,
			activo: true,
		});

		res.status(201).json({
			message: 'Usuario creado con éxito',
			usuario: {
				id: nuevoUsuario.id_usuario,
				username: nuevoUsuario.username,
			},
			personal_administrativo: {
				id: nuevoPersonal.id_personal_admin,
				nombre: nuevoPersonal.nombre,
				apellido: nuevoPersonal.apellido,
			},
		});
	} catch (error) {
		res.status(500).json({ message: 'Error al registrar el usuario' });
	}
};

// ✏️ Actualizar usuario
export const updateUsuario = async (req, res) => {
	try {
		const { username, password } = req.body;
		const usuario = await Usuario.findByPk(req.params.id);
		if (!usuario)
			return res.status(404).json({ message: 'Usuario no encontrado' });

		if (username) usuario.username = username;
		if (password) usuario.password = await bcrypt.hash(password, 10);

		await usuario.save();
		res.json({ message: 'Usuario actualizado correctamente' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// ❌ Borrado lógico
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
			include: {
				model: PersonalSalud,
				as: 'datos_medico',
				where: {
					id_rol_usuario: 4, 
					activo: true       
				},
				attributes: ['id_personal_salud', 'nombre', 'apellido', 'matricula'],
			},
			attributes: ['id_usuario', 'username'],
		});

		const resultado = medicos.map(m => ({
			id_usuario: m.id_usuario,
			id_personal_salud: m.datos_medico.id_personal_salud, // <-- agregar este campo
			nombre: m.datos_medico.nombre,
			apellido: m.datos_medico.apellido,
			matricula: m.datos_medico.matricula,
		}));

		res.json(resultado);
	} catch (error) {
		console.error('❌ Error al listar médicos:', error);
		res.status(500).json({ message: 'Error al obtener médicos' });
	}
};
