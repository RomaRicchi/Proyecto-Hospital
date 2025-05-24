import { Usuario } from '../models/index.js';
import bcrypt from 'bcrypt';

// 📥 Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
	try {
		const usuarios = await Usuario.findAll();
		res.json(usuarios);
	} catch (error) {
		res.status(500).json({ message: error.message });
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

// ➕ Crear usuario nuevo (con hash)
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

		// 1. Crear usuario
		const nuevoUsuario = await Usuario.create({
			username,
			password: hashedPassword,
			estado: true,
		});

		// 2. Crear entrada en personal_administrativo
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
		console.error('❌ Error al crear usuario:', error);
		res.status(500).json({ message: 'Error al registrar el usuario' });
	}
};

// ✏️ Actualizar usuario (opcionalmente password)
export const updateUsuario = async (req, res) => {
	try {
		const { username, password } = req.body;
		const usuario = await Usuario.findByPk(req.params.id);

		if (!usuario)
			return res.status(404).json({ message: 'Usuario no encontrado' });

		// Actualizar campos permitidos
		if (username) usuario.username = username;
		if (password) {
			const hashedPassword = await bcrypt.hash(password, 10);
			usuario.password = hashedPassword;
		}

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
