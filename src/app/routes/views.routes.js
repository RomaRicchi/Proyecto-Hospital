import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
	vistaPacientes,
	vistaPacienteNuevo,
} from '../controllers/paciente.controller.js'; // Asegúrate de importar

const router = Router();

// 🔸 Dashboard
router.get('/dashboard', isAuthenticated, (req, res) =>
	res.render('dashboard')
);

// 🔸 Pacientes
router.get('/pacientes', isAuthenticated, vistaPacientes);
router.get('/paciente/nuevo', isAuthenticated, vistaPacienteNuevo); // Cambiado para usar el controlador
router.get('/pacientes/camas', isAuthenticated, (req, res) =>
	res.render('pacientesCamas')
);

// 🔸 Internaciones
router.get('/internaciones', isAuthenticated, (req, res) =>
	res.render('internaciones')
);
router.get('/admisiones', isAuthenticated, (req, res) =>
	res.render('admisiones')
);
router.get('/motivos-ingreso', isAuthenticated, (req, res) =>
	res.render('motivoIngreso')
);

// 🔸 Habitaciones y Camas
router.get('/habitaciones', isAuthenticated, (req, res) =>
	res.render('habitacion')
);
router.get('/habitaciones/nueva', isAuthenticated, (req, res) =>
	res.render('habitacionNueva')
);
router.get('/camas', isAuthenticated, (req, res) => res.render('camas'));
router.get('/camas/editar', isAuthenticated, (req, res) =>
	res.render('camasEditar')
);
router.get('/sectores/nuevo', isAuthenticated, (req, res) =>
	res.render('sectorNuevo')
);
router.get('/movimientos-habitacion', isAuthenticated, (req, res) =>
	res.render('movHabitacion')
);
router.get('/movimientos-habitacion/editar', isAuthenticated, (req, res) =>
	res.render('movHabitacionEditar')
);

// 🔸 Administración
router.get('/usuarios', isAuthenticated, (req, res) => res.render('usuarios'));
router.get('/usuarios/editar', isAuthenticated, (req, res) =>
	res.render('usuariosEditar')
);
router.get('/obras-sociales', isAuthenticated, (req, res) =>
	res.render('obraSocial')
);
router.get('/localidades', isAuthenticated, (req, res) =>
	res.render('localidades')
);
router.get('/buscar-familiar', isAuthenticated, (req, res) =>
	res.render('buscarFamiliar')
);

export default router;
