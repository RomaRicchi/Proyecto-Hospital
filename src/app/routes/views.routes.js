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
// Cambia esta línea:
// import { vistaCamas } from '../controllers/cama.controller.js';
// Por esta:
import { getCamas } from '../controllers/cama.controller.js';
import { vistaHabitaciones } from '../controllers/habitacion.controller.js';
import { vistaParentescos } from '../controllers/parentesco.controller.js';
import { vistaObrasSociales } from '../controllers/obraSocial.controller.js';
import { vistaUsuarios } from '../controllers/usuario.controller.js';
import { vistaAdmisiones } from '../controllers/admision.controller.js';
import { vistaMotivosIngreso } from '../controllers/motivoIngreso.controller.js';
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
router.get('/paciente/genero', isAuthenticated, vistaGeneros);

// 🔸 Familiar
router.get('/familiar', isAuthenticated, vistaFamiliares);
router.get('/familiar/parentesco', isAuthenticated, vistaParentescos);

// 🔸 Ubicación
router.get('/sector', isAuthenticated, vistaSectores);
router.get('/habitacion', isAuthenticated, vistaHabitaciones);
// Cambia esta línea:
// router.get('/camas', isAuthenticated, vistaCamas);
// Por esta:
router.get('/camas', isAuthenticated, getCamas);

// 🔸 Admisiones e Internaciones
router.get('/admisiones', isAuthenticated, vistaAdmisiones);
router.get('/internaciones', isAuthenticated, (req, res) =>
	res.render('internaciones')
);
router.get('/motivoIngreso', isAuthenticated, vistaMotivosIngreso);
router.get(
	'/movimientoHabitacion',
	isAuthenticated,
	vistaMovimientosHabitacion
);

router.get('/movimiento', isAuthenticated, vistaMovimientos);
router.get('/paciente/alta', isAuthenticated, (req, res) =>
  res.render('altaPaciente')
);
// 🔸 Administración
router.get('/obraSocial', isAuthenticated, vistaObrasSociales);
router.get('/usuarios', isAuthenticated, (req, res) => res.render('users'));

// 🔸 Emergencias
router.get('/emergencias', isAuthenticated, (req, res) =>
	res.render('emergencia')
);

// 🔸 Habitaciones
router.get('/habitacion', isAuthenticated, vistaHabitaciones);

// Rutas protegidas y vistas
router.get('/usuario', isAuthenticated, vistaUsuarios);

export default router;
