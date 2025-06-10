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
		const user = await Usuario.findOne({ where: { username: usuario } });

		if (!user) {
			return res
				.status(401)
				.render('users', { error: 'Usuario no encontrado' });
		}

		const valido = await bcrypt.compare(password, user.password);
		if (!valido) {
			return res
				.status(401)
				.render('users', { error: 'Contraseña incorrecta' });
		}

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
		res.status(500).render('users', { error: 'Error interno del servidor' });
	}
};

// 🚪 Cierre de sesión
export const logout = (req, res) => {
	req.session.destroy(() => res.redirect('/home'));
};
