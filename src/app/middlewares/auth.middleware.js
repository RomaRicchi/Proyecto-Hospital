export function isAuthenticated(req, res, next) {
	if (req.session.usuario) {
		next();
	} else {
		res.redirect('/login');
	}
}
export function soloRol(rolesPermitidos = [1,2,3,4]) {
	return function (req, res, next) {
		const usuario = req.session.usuario;

		if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
			return res.status(403).send('Acceso denegado');
		}

		next();
	};
}
