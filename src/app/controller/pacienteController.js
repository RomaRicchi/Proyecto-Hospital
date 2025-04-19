const connection = require('../bd');

// Mostrar la página de inicio con lista de médicos simulada
const mostrarInicio = (req, res) => {
  const medicos = [
    { nombre: 'Dr. Alejandro Pérez', especialidad: 'Clínica médica' },
    { nombre: 'Dra. Lucía Fernández', especialidad: 'Cardiología' },
    { nombre: 'Dr. Javier Torres', especialidad: 'Neumonología' },
    { nombre: 'Dra. Mariana López', especialidad: 'Infectología' },
    { nombre: 'Dr. Carlos Gómez', especialidad: 'Neurología' }
  ];
  res.render('inicio', { medicos });
};

// Login básico para Admin
const login = (req, res) => {
  const { usuario, password } = req.body;

  if (usuario === 'admin' && password === '1234') {
    req.session.usuario = { nombre: 'Admin general', rol: 'admin' };
    return res.redirect('/dashboard');
  }

  res.status(401).render('users', { error: 'Credenciales incorrectas' });
};

// Logout del sistema
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// Renderizar vistas básicas
const vistaLogin = (req, res) => res.render('users');
const vistaDashboard = (req, res) => res.render('dashboard');
const vistaInternaciones = (req, res) => res.render('internaciones');

// Listar pacientes activos con info de cama si están internados
const listarPacientes = (req, res) => {
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
      console.error('❌ Error al listar pacientes:', err);
      return res.status(500).render('paciente', { pacientes: [] });
    }

    res.setHeader('Cache-Control', 'no-store');
    res.render('paciente', { pacientes: results });
  });
};

// Buscar paciente dado de baja por DNI
const buscarPorDni = (req, res) => {
  const { dni } = req.query;

  if (!dni) return res.status(400).json({ error: true, mensaje: 'DNI faltante' });

  const sql = 'SELECT * FROM paciente WHERE dni_paciente = ? AND estado = 0';

  connection.query(sql, [dni], (err, results) => {
    if (err) {
      console.error('❌ Error al buscar paciente por DNI:', err);
      return res.status(500).json({ error: true });
    }

    if (results.length > 0) {
      const p = results[0];
      return res.json({ 
        encontrado: true, 
        nombre_p: p.nombre_p, 
        apellido_p: p.apellido_p, 
        cobertura: p.cobertura 
      });
    }

    res.json({ encontrado: false });
  });
};

module.exports = {
  mostrarInicio,
  login,
  logout,
  vistaLogin,
  vistaDashboard,
  vistaInternaciones,
  listarPacientes,
  buscarPorDni
};
