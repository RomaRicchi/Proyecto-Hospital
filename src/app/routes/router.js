const express = require('express');
const router = express.Router();
const connection = require('../bd');

// Vista pública: inicio
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

// Login
router.post('/login', (req, res) => {
  const { usuario, password } = req.body;
  if (usuario === 'admin' && password === '1234') {
    req.session.usuario = {
      nombre: 'Admin general',
      rol: 'admin'
    };
    res.redirect('/dashboard');
  } else {
    res.render('users', { error: 'Credenciales incorrectas' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Vistas internas
router.get('/dashboard', (req, res) => res.render('dashboard'));
router.get('/internaciones', (req, res) => res.render('internaciones'));
router.get('/usuarios', (req, res) => res.render('users'));

// 🟢 Ruta correcta para listar pacientes
router.get('/pacientes', (req, res) => {
  const sql = `
    SELECT 
      p.id_paciente,
      p.dni_paciente,
      p.apellido_p,
      p.nombre_p,
      p.fecha_nac,
      p.genero,
      p.cobertura,
      p.telefono,
      p.email,
      h.sector,
      h.num AS habitacion,
      h.cama
    FROM paciente p
    LEFT JOIN admision a ON p.id_paciente = a.id_paciente AND a.estado = 1
    LEFT JOIN movimiento_habitacion mh ON a.id_admision = mh.id_admision AND mh.estado = 1
    LEFT JOIN habitacion h ON mh.id_habitacion = h.id_habitacion
    WHERE p.estado = 1;
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener pacientes:', err);
      return res.render('paciente', { pacientes: [] });
    }

    console.log('📋 Pacientes encontrados:', results);
    res.setHeader('Cache-Control', 'no-store');
    res.render('paciente', { pacientes: results });
  });
});

router.get('/api/paciente-por-dni', (req, res) => {
  const dni = req.query.dni;

  const sql = 'SELECT * FROM paciente WHERE dni_paciente = ? AND estado = 0';
  connection.query(sql, [dni], (err, results) => {
    if (err) return res.json({ error: true });

    if (results.length > 0) {
      const paciente = results[0];
      res.json({
        encontrado: true,
        nombre_p: paciente.nombre_p,
        apellido_p: paciente.apellido_p,
        cobertura: paciente.cobertura
      });
    } else {
      res.json({ encontrado: false });
    }
  });
});

router.get('/admisiones', (req, res) => {
  const sql = `
    SELECT * FROM habitacion 
    WHERE estado = 0
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener habitaciones:', err);
      return res.render('admisiones', { habitaciones: [] });
    }

    res.render('admisiones', { habitaciones: results });
  });
});


module.exports = router;
