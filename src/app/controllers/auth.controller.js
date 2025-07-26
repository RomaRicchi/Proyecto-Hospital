import {
	Usuario,
	PersonalAdministrativo,
	PersonalSalud,
	RolUsuario,
} from '../models/index.js';
import bcrypt from 'bcrypt';

export const vistaLogin = (req, res) => {
  if (req.session.usuario) {
    const rol = req.session.usuario.rol;
    if ([3, 4].includes(rol)) return res.redirect('/panel-salud');
    return res.redirect('/dashboard');
  }

  res.render('users', { error: null });
};

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

		let personal = await PersonalAdministrativo.findOne({
			where: { id_usuario: user.id_usuario },
			include: [{ model: RolUsuario, as: 'rol' }],
		});

		if (!personal) {
			const { PersonalSalud } = await import('../models/index.js');
			personal = await PersonalSalud.findOne({
				where: { id_usuario: user.id_usuario },
				include: [{ model: RolUsuario, as: 'rol' }],
			});
		}

		if (!personal) {
			return res
				.status(403)
				.render('users', { error: 'El usuario no tiene asignado un rol válido' });
		}

		req.session.usuario = {
			id: user.id_usuario,
			nombre: personal?.nombre || 'Usuario',
			apellido: personal?.apellido || '',
			rol: personal?.id_rol_usuario || 1,
			username: user.username,
			id_personal_salud: personal?.id_personal_salud || null 
		};

		if ([3, 4].includes(personal?.id_rol_usuario)) {
			return res.redirect('/panel-salud');
		} else {
			return res.redirect('/dashboard');
		}

	} catch (error) {
		res.status(500).render('users', { error: 'Error interno del servidor' });
	}
};

export const logout = (req, res) => {
	req.session.destroy(() => res.redirect('/home'));
};
