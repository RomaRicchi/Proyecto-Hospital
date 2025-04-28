const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");
const usuarioController = require("../controllers/usuarioController");
const pacienteController = require("../controllers/pacienteController");
const admisionController = require("../controllers/admisionController");
const habitacionController = require('../controllers/habitacionController');




// Página pública de inicio
router.get("/", publicController.mostrarInicio);

// Login / logout
router.post("/login", usuarioController.login);
router.get("/logout", usuarioController.logout);
router.get("/usuarios", usuarioController.vistaLogin);

function protegerRuta(req, res, next) {
    if (req.session.usuario) {
      next();
    } else {
      res.redirect("/usuarios"); // o como llames a tu login
    }
  }

  // Rutas protegidas
router.get("/dashboard", protegerRuta, pacienteController.vistaDashboard);
router.get("/internaciones", protegerRuta, pacienteController.vistaInternaciones);

// Pacientes
router.get("/pacientes", protegerRuta, pacienteController.listarPacientes);
router.get("/api/paciente-por-dni", protegerRuta, pacienteController.buscarPorDni);

// Admisiones
router.get("/admisiones", protegerRuta, admisionController.vistaFormulario);
router.post("/admisiones", protegerRuta, admisionController.crearInternacion);

// Habitaciones
// Habitaciones (Camas)
router.get('/camas', protegerRuta, habitacionController.listarCamas);
router.post('/camas/nueva', protegerRuta, habitacionController.crearCama);
router.post('/camas/eliminar/:id', protegerRuta, habitacionController.eliminarCama);
router.post('/camas/editar/:id', protegerRuta, habitacionController.editarCama);



module.exports = router;
