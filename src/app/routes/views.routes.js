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
import { getCamas } from '../controllers/cama.controller.js';
import { vistaHabitaciones } from '../controllers/habitacion.controller.js';
import { vistaParentescos } from '../controllers/parentesco.controller.js';
import { vistaObrasSociales } from '../controllers/obraSocial.controller.js';
import { vistaUsuarios } from '../controllers/usuario.controller.js';
import { vistaAdmisiones } from '../controllers/admision.controller.js';
import { vistaMotivosIngreso } from '../controllers/motivoIngreso.controller.js';
import { vistaMovimientos } from '../controllers/movimiento.controller.js';
import { vistaMovimientosHabitacion } from '../controllers/movimientoHabitacion.controller.js';
import { vistaPacientesCamas } from '../controllers/pacientesCamas.controller.js';
import { vistaDashboard } from '../controllers/dashboard.controller.js';
import { vistaEmergencias } from '../controllers/emergencia.controller.js';
import { vistaAltaPaciente } from '../controllers/alta.controller.js';

const router = Router();

router.get('/inicio', (req, res) => res.render('inicio'));
router.get('/usuarios', isAuthenticated, (req, res) => res.render('users')); //loguin
// 🔸 Panel Principal
router.get('/dashboard', isAuthenticated, vistaDashboard);

// 🔸 Pacientes
router.get('/paciente', isAuthenticated, vistaPacientes);
router.get('/paciente/nuevo', isAuthenticated, vistaPacienteNuevo);
router.get('/pacientes/camas', isAuthenticated, vistaPacientesCamas);

// 🔸 Localidad y Género
router.get('/paciente/localidad', isAuthenticated, vistaLocalidades);
router.get('/paciente/genero', isAuthenticated, vistaGeneros);

// 🔸 Familiar
router.get('/familiar', isAuthenticated, vistaFamiliares);
router.get('/familiar/parentesco', isAuthenticated, vistaParentescos);

// 🔸 Ubicación
router.get('/sector', isAuthenticated, vistaSectores);
router.get('/habitacion', isAuthenticated, vistaHabitaciones);
router.get('/camas', isAuthenticated, getCamas);

// 🔸 Admisiones
router.get('/admisiones', isAuthenticated, vistaAdmisiones);
router.get('/motivoIngreso', isAuthenticated, vistaMotivosIngreso);
router.get('/movimientoHabitacion', isAuthenticated, vistaMovimientosHabitacion);
router.get('/movimiento', isAuthenticated, vistaMovimientos);
router.get('/paciente/alta', isAuthenticated, vistaAltaPaciente);
router.get('/obraSocial', isAuthenticated, vistaObrasSociales);

// 🔸 Emergencias
router.get('/emergencias', isAuthenticated, vistaEmergencias);

// 🔸 Usuarios
router.get('/usuario', isAuthenticated, vistaUsuarios);


export default router;
