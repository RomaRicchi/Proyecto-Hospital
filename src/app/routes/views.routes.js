import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
	vistaPacientes,
	vistaPacienteNuevo,
} from '../controllers/paciente.controller.js';
import { vistaLocalidades } from '../controllers/localidad.controller.js';
import { vistaGeneros } from '../controllers/genero.controller.js';
import { vistaFamiliares } from '../controllers/familiar.controller.js';
import { vistaSectores } from '../controllers/sector.controller.js';
import { vistaCamas } from '../controllers/cama.controller.js';
import { vistaHabitaciones } from '../controllers/habitacion.controller.js';

const router = Router();

// 🔸 Panel Principal
router.get('/dashboard', isAuthenticated, (req, res) =>
	res.render('dashboard')
);
router.get('/inicio', (req, res) => res.render('inicio'));

// 🔸 Pacientes
router.get('/paciente', isAuthenticated, vistaPacientes); // paciente.pug
router.get('/paciente/nuevo', isAuthenticated, vistaPacienteNuevo);
router.get('/pacientes/camas', isAuthenticated, (req, res) =>
	res.render('pacientesCamas')
); // pacientesCamas.pug

// 🔸 Localidad y Género
router.get('/paciente/localidad', isAuthenticated, vistaLocalidades);
// localidad.pug
router.get('/paciente/genero', isAuthenticated, vistaGeneros);
// genero.pug

// 🔸 Familiar
router.get('/familiar', isAuthenticated, vistaFamiliares);
router.get('/familiar/parentesco', isAuthenticated, (req, res) =>
	res.render('parentesco')
); // parentesco.pug

// 🔸 Ubicación
router.get('/sector', isAuthenticated, vistaSectores);  // sector.pug
router.get('/habitacion', isAuthenticated, vistaHabitaciones);  // Renderiza habitacion.pug
router.get('/camas', isAuthenticated, vistaCamas);  // Renderiza cama.pug

// 🔸 Admisiones e Internaciones
router.get('/admisiones', isAuthenticated, (req, res) =>
	res.render('admision')
); // admision.pug
router.get('/internaciones', isAuthenticated, (req, res) =>
	res.render('internaciones')
); // internaciones.pug
router.get('/motivoIngreso', isAuthenticated, (req, res) =>
	res.render('motivoIngreso')
); // motivoIngreso.pug
router.get('/movimientoHabitacion', isAuthenticated, (req, res) =>
	res.render('movHabitacion')
); // movHabitacion.pug

// 🔸 Administración
router.get('/obraSocial', isAuthenticated, (req, res) =>
	res.render('obraSocial')
); // obraSocial.pug
router.get('/usuarios', isAuthenticated, (req, res) => res.render('users')); // users.pug
router.get('/usuario', isAuthenticated, (req, res) => res.render('usuario')); // usuario.pug

// 🔸 Emergencias
router.get('/emergencias', isAuthenticated, (req, res) =>
	res.render('emergencia')
); // emergencia.pug

export default router;
