const express = require('express');
const router = express.Router();

const pacienteController = require('../controllers/pacienteController');
const admisionController = require('../controllers/admisionController');

// Rutas públicas
router.get('/', pacienteController.mostrarInicio);
router.post('/login', pacienteController.login);
router.get('/logout', pacienteController.logout);
router.get('/usuarios', pacienteController.vistaLogin);
router.post('/admisiones', admisionController.crearInternacion);


// Rutas internas
router.get('/dashboard', pacienteController.vistaDashboard);
router.get('/internaciones', pacienteController.vistaInternaciones);
router.get('/pacientes', pacienteController.listarPacientes);
router.get('/api/paciente-por-dni', pacienteController.buscarPorDni);

// Admisiones
router.get('/admisiones', admisionController.vistaFormulario);

module.exports = router;
