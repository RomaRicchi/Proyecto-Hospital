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
import { vistaParentescos } from '../controllers/parentesco.controller.js';
import { vistaObrasSociales } from '../controllers/obraSocial.controller.js';
import { vistaUsuarios } from '../controllers/usuario.controller.js';
import { vistaAdmisiones } from '../controllers/admision.controller.js';
import { vistaMotivosIngreso }  from '../controllers/motivoIngreso.controller.js';
import { vistaMovimientos } from '../controllers/movimiento.controller.js';
import { vistaMovimientosHabitacion } from '../controllers/movimientoHabitacion.controller.js';

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
router.get('/familiar/parentesco', isAuthenticated, vistaParentescos); // Renderiza parentesco.pug

// 🔸 Ubicación
router.get('/sector', isAuthenticated, vistaSectores); // sector.pug
router.get('/habitacion', isAuthenticated, vistaHabitaciones); // Renderiza habitacion.pug
router.get('/camas', isAuthenticated, vistaCamas); // Renderiza cama.pug

// 🔸 Admisiones e Internaciones
router.get('/admisiones', isAuthenticated, vistaAdmisiones); // admision.pug
router.get('/internaciones', isAuthenticated, (req, res) =>
	res.render('internaciones')
); // internaciones.pug
router.get('/motivo_ingreso', isAuthenticated, vistaMotivosIngreso);
router.get('/movimiento_habitacion', isAuthenticated, vistaMovimientosHabitacion); // movHabitacion.pug
router.get('/movimiento', isAuthenticated, vistaMovimientos);

// 🔸 Administración
router.get('/obraSocial', isAuthenticated, vistaObrasSociales);
router.get('/usuarios', isAuthenticated, (req, res) => res.render('users')); // users.pug

// 🔸 Emergencias
router.get('/emergencias', isAuthenticated, (req, res) =>
	res.render('emergencia')
); // emergencia.pug

// 🔸 Habitaciones
router.get('/habitacion', isAuthenticated, vistaHabitaciones);

// Rutas protegidas y vistas
router.get('/usuario', isAuthenticated, vistaUsuarios);

export default router;
