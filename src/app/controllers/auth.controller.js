import {
	Usuario,
	PersonalAdministrativo,
	RolUsuario,
} from '../models/index.js';
import bcrypt from 'bcrypt';  

// 🧾 Vista para mostrar el login
export const vistaLogin = (req, res) => {
	res.render('users', { error: null });
};

// 🔐 Lógica de inicio de sesión
export const login = async (req, res) => {
	const { usuario, password } = req.body;

	try {
		console.log('🟡 Intentando login con:', usuario);

		const user = await Usuario.findOne({ where: { username: usuario } });

		if (!user) {
			console.log('🔴 Usuario no encontrado');
			return res
				.status(401)
				.render('users', { error: 'Usuario no encontrado' });
		}

		console.log('🟢 Usuario encontrado:', user.username);
		console.log('📌 Hashed en BD:', user.password);
		console.log('📌 Contraseña ingresada:', password);

		const valido = await bcrypt.compare(password, user.password);
		if (!valido) {
			console.log('🔴 Contraseña incorrecta');
			return res
				.status(401)
				.render('users', { error: 'Contraseña incorrecta' });
		}

		console.log('✅ Contraseña válida. Login exitoso');

		// 🧑‍💼 Buscar datos del personal administrativo y su rol
		const personal = await PersonalAdministrativo.findOne({
			where: { id_usuario: user.id_usuario },
			include: [{ model: RolUsuario, as: 'rol' }],
		});

		// 🗂️ Guardar info mínima en sesión
		req.session.usuario = {
			id: user.id_usuario,
			nombre: personal?.nombre || 'Usuario',
			apellido: personal?.apellido || '',
			rol: personal?.rol?.nombre || 'usuario',
		};

		res.redirect('/dashboard');
	} catch (error) {
		console.error('❌ Error en login:', error);
		res.status(500).render('users', { error: 'Error interno del servidor' });
	}
};

// 🚪 Cierre de sesión
export const logout = (req, res) => {
	req.session.destroy(() => res.redirect('/home'));
};
