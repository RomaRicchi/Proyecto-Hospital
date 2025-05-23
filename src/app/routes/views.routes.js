import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

// Cada vista protegida renderiza un archivo PUG extendido de layout_modular
router.get('/dashboard', isAuthenticated, (req, res) => {
	res.render('dashboard');
});

router.get('/pacientes', isAuthenticated, (req, res) => {
	res.render('paciente');
});

router.get('/internaciones', isAuthenticated, (req, res) => {
	res.render('internaciones');
});

router.get('/admisiones', isAuthenticated, (req, res) => {
	res.render('admisiones');
});

router.get('/camas', isAuthenticated, (req, res) => {
	res.render('camas');
});

// Podés seguir agregando más rutas protegidas según tus vistas

export default router;
