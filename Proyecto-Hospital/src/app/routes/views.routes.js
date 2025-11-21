import { Router } from 'express';
import { isAuthenticated, soloRol } from '../middlewares/auth.middleware.js';
import { vistaPacientes } from '../controllers/paciente.controller.js';
import { vistaLocalidades } from '../controllers/localidad.controller.js';
import { vistaGeneros } from '../controllers/genero.controller.js';
import { vistaFamiliares } from '../controllers/familiar.controller.js';
import { vistaSectores } from '../controllers/sector.controller.js';
import { vistaCama } from '../controllers/cama.controller.js';
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
import { vistaReservarCama } from '../controllers/confirmarReserva.controller.js';
import { vistaPersonalSalud } from '../controllers/personalSalud.controller.js';
import { vistaPersonalAdministrativo } from '../controllers/personalAdministrativo.controller.js';
import { vistaRegistroClinico } from '../controllers/registroClinico.controller.js';
import { vistaEspecialidades } from '../controllers/especialidad.controller.js';
import { vistaRolUsuario } from '../controllers/rolUsuario.controller.js';
import { vistaTipoRegistro } from '../controllers/tipoRegistro.controller.js';
import { vistaPanelSalud } from '../controllers/dashSalud.controller.js';
import { vistaTurnos } from '../controllers/turno.controller.js';
import { vistaEstadoTurno } from '../controllers/estadoTurno.controller.js';
import { vistaAgendas } from '../controllers/agenda.controller.js';
import { vistaDias } from '../controllers/dia.controller.js';
import { vistaLogin } from '../controllers/auth.controller.js';
import { vistaCalendario } from '../controllers/calendario.controller.js';
const router = Router();

router.get('/login', vistaLogin); 
// 🔸 Panel Principal
router.get('/dashboard', isAuthenticated,soloRol([1, 2]), vistaDashboard);
router.get('/panel-salud', isAuthenticated, soloRol([3, 4]), vistaPanelSalud);
// 🔸 Pacientes
router.get('/paciente', isAuthenticated, vistaPacientes);
router.get('/pacientes/camas', isAuthenticated, vistaPacientesCamas);
// 🔸 Historia clinica
router.get('/tipoRegistro', isAuthenticated, soloRol([1]), vistaTipoRegistro);
router.get('/registroClinico', isAuthenticated, soloRol([1, 3, 4]), vistaRegistroClinico);
// 🔸 Localidad y Género
router.get('/paciente/localidad', isAuthenticated, soloRol([1, 2]), vistaLocalidades);
router.get('/paciente/genero', isAuthenticated, soloRol([1]), vistaGeneros);
// 🔸 Familiar
router.get('/familiar', isAuthenticated, soloRol([1, 2]), vistaFamiliares);
router.get('/familiar/parentesco', isAuthenticated, soloRol([1]), vistaParentescos);
// 🔸 Ubicación
router.get('/sector', isAuthenticated,soloRol([1]), vistaSectores);
router.get('/habitacion', isAuthenticated, soloRol([1]), vistaHabitaciones);
router.get('/camas', isAuthenticated, soloRol([1, 2, 3]), vistaCama);
// 🔸 Admisiones
router.get('/admisiones', isAuthenticated, soloRol([1, 2]), vistaAdmisiones);
router.get('/motivoIngreso', isAuthenticated, soloRol([1]), vistaMotivosIngreso);
router.get('/movimientoHabitacion', isAuthenticated, soloRol([1, 2, 3]), vistaMovimientosHabitacion);
router.get('/movimiento', isAuthenticated, soloRol([1]), vistaMovimientos);
router.get('/paciente/alta', isAuthenticated, soloRol([1, 4]), vistaAltaPaciente);
router.get('/obraSocial', isAuthenticated, soloRol([1, 2]), vistaObrasSociales);
router.get('/reserva-cama', isAuthenticated, soloRol([1, 2]), vistaReservarCama);
// 🔸 Emergencias
router.get('/emergencias', isAuthenticated, soloRol([1, 2]), vistaEmergencias);
// 🔸 Usuarios
router.get('/usuario', isAuthenticated, soloRol([1]), vistaUsuarios);
router.get('/personal/salud', isAuthenticated,soloRol([1]), vistaPersonalSalud);
router.get('/personal/administrativo', isAuthenticated, soloRol([1]), vistaPersonalAdministrativo);
router.get('/especialidad', isAuthenticated, soloRol([1]), vistaEspecialidades);
router.get('/rolUsuario', isAuthenticated, soloRol([1]), vistaRolUsuario);

router.get('/turnos', isAuthenticated, soloRol([1, 2, 4]), vistaTurnos);
router.get('/agenda', isAuthenticated, soloRol([1, 2, 4]), vistaAgendas);
router.get('/dias-semana', isAuthenticated, soloRol([1]), vistaDias);
router.get('/estado-turno', isAuthenticated, soloRol([1]), vistaEstadoTurno);
router.get('/calendario', isAuthenticated, soloRol([1, 2, 4]), vistaCalendario);

export default router;
