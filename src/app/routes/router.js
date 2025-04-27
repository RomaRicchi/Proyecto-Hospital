const express = require("express");
const router = express.Router();

<<<<<<< HEAD
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
=======
router.get('/', (req, res) => {
  const medicos = [
    { nombre: 'Dr. Alejandro Pérez', especialidad: 'Clínica médica', foto: 'https://randomuser.me/api/portraits/men/10.jpg' },
    { nombre: 'Dra. Lucía Fernández', especialidad: 'Cardiología', foto: 'https://randomuser.me/api/portraits/women/11.jpg' },
    { nombre: 'Dr. Javier Torres', especialidad: 'Neumonología', foto: 'https://randomuser.me/api/portraits/men/12.jpg' },
    { nombre: 'Dra. Mariana López', especialidad: 'Infectología', foto: 'https://randomuser.me/api/portraits/women/13.jpg' },
    { nombre: 'Dr. Carlos Gómez', especialidad: 'Neurología', foto: 'https://randomuser.me/api/portraits/men/14.jpg' },
    { nombre: 'Dra. Gabriela Ruiz', especialidad: 'Clínica médica', foto: 'https://randomuser.me/api/portraits/women/15.jpg' },
    { nombre: 'Dr. Martín Díaz', especialidad: 'Gastroenterología', foto: 'https://randomuser.me/api/portraits/men/16.jpg' },
    { nombre: 'Dra. Ana Sánchez', especialidad: 'Nefrología', foto: 'https://randomuser.me/api/portraits/women/17.jpg' },
    { nombre: 'Dr. Diego Herrera', especialidad: 'Hematología', foto: 'https://randomuser.me/api/portraits/men/18.jpg' },
    { nombre: 'Dra. Sofía Núñez', especialidad: 'Endocrinología', foto: 'https://randomuser.me/api/portraits/women/19.jpg' }
  ];
  res.render('inicio', { medicos });
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

router.get('/', (req, res) => {
  res.render('inicio'); // esta vista no requiere login
});


>>>>>>> parent of ed6d08a (login y mas)

// Admisiones
router.get("/admisiones", admisionController.vistaFormulario);
router.post("/admisiones", admisionController.crearInternacion);

module.exports = router;
