export function isAuthenticated(req, res, next) {
	if (req.session.usuario) {
		next();
	} else {
		res.redirect('/usuarios');
	}
}
