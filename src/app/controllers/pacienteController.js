const connection = require('../bd');

// Funciones controladoras
const vistaDashboard = (req, res) => res.render('dashboard');
const vistaInternaciones = (req, res) => res.render('internaciones');

const listarPacientes = (req, res) => {
  connection.query('SELECT * FROM paciente WHERE estado = 1', (err, pacientes) => {
    if (err) {
      console.error('Error al listar pacientes:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.render('paciente', { pacientes });
  });
};

const buscarPorDni = (req, res) => {
  // Aquí después implementás buscar por DNI
};

// Exportar todas las funciones de una sola vez
module.exports = {
  vistaDashboard,
  vistaInternaciones,
  listarPacientes,
  buscarPorDni
};
