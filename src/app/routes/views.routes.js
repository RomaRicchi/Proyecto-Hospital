import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
	vistaPacientes,
	vistaPacienteNuevo,
} from '../controllers/paciente.controller.js';

const router = Router();

// 🔸 Panel
router.get('/dashboard', isAuthenticated, (req, res) =>
	res.render('dashboard')
);

// 🔸 Pacientes
router.get('/paciente', isAuthenticated, vistaPacientes); // paciente.pug
router.get('/paciente/nuevo', isAuthenticated, vistaPacienteNuevo); // pacienteNuevo.pug
router.get('/pacientes/camas', isAuthenticated, (req, res) =>
	res.render('pacientesCamas')
); // pacientesCamas.pug
router.get('/paciente/localidad', isAuthenticated, (req, res) =>
	res.render('localidades')
); // localidades.pug
router.get('/paciente/genero', isAuthenticated, (req, res) =>
	res.render('genero')
); // genero.pug

// 🔸 Familiar
router.get('/familiar', isAuthenticated, (req, res) => res.render('familiar')); // familiar.pug
router.get('/familiar/parentesco', isAuthenticated, (req, res) =>
	res.render('parentesco')
); // parentesco.pug

// 🔸 Ubicación
router.get('/sector', isAuthenticated, (req, res) => res.render('sectorNuevo')); // sectorNuevo.pug
router.get('/habitacion', isAuthenticated, (req, res) =>
	res.render('habitacion')
); // habitacion.pug
router.get('/habitacion/nueva', isAuthenticated, (req, res) =>
	res.render('habitacionNueva')
); // habitacionNueva.pug
router.get('/camas', isAuthenticated, (req, res) => res.render('camas')); // camas.pug
router.get('/camas/editar', isAuthenticated, (req, res) =>
	res.render('camasEditar')
); // camasEditar.pug

// 🔸 Admisiones
router.get('/admisiones', isAuthenticated, (req, res) =>
	res.render('admisiones')
); // admisiones.pug
router.get('/motivoIngreso', isAuthenticated, (req, res) =>
	res.render('motivoIngreso')
); // motivoIngreso.pug
router.get('/movimientoHabitacion', isAuthenticated, (req, res) =>
	res.render('movHabitacion')
); // movHabitacion.pug
router.get('/movimientoHabitacion/movimiento', isAuthenticated, (req, res) =>
	res.render('movHabitacionEditar')
); // movHabitacionEditar.pug
router.get('/obraSocial', isAuthenticated, (req, res) =>
	res.render('obraSocial')
); // obraSocial.pug
router.get('/emergencias', isAuthenticated, (req, res) =>
	res.render('emergencias')
); // emergencias.pug (agregar esta vista si falta)

// 🔸 Usuarios
router.get('/usuarios', isAuthenticated, (req, res) => res.render('usuarios')); // usuarios.pug
router.get('/usuarios/editar', isAuthenticated, (req, res) =>
	res.render('usuariosEditar')
); // usuariosEditar.pug
router.get('/buscar-familiar', isAuthenticated, (req, res) =>
	res.render('buscarFamiliar')
); // buscarFamiliar.pug

// 🔸 Otros
router.get('/inicio', (req, res) => res.render('inicio')); // inicio.pug

export default router;
