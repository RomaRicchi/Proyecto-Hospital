const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");
const usuarioController = require("../controllers/usuarioController");
const pacienteController = require("../controllers/pacienteController");
const admisionController = require("../controllers/admisionController");

// Página pública de inicio
router.get("/", publicController.mostrarInicio);

// Login / logout
router.post("/login", usuarioController.login);
router.get("/logout", usuarioController.logout);
router.get("/usuarios", usuarioController.vistaLogin);

// Rutas protegidas
router.get("/dashboard", pacienteController.vistaDashboard);
router.get("/internaciones", pacienteController.vistaInternaciones);
router.get("/pacientes", pacienteController.listarPacientes);
router.get("/api/paciente-por-dni", pacienteController.buscarPorDni);

// Admisiones
router.get("/admisiones", admisionController.vistaFormulario);
router.post("/admisiones", admisionController.crearInternacion);

module.exports = router;
