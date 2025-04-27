const connection = require('../bd');

const vistaDashboard = (req, res) => res.render('dashboard');
const vistaInternaciones = (req, res) => res.render('internaciones');

const listarPacientes = (req, res) => {
  // tu SQL original está perfecto
};

const buscarPorDni = (req, res) => {
  // tu código original también está bien
};

module.exports = {
  vistaDashboard,
  vistaInternaciones,
  listarPacientes,
  buscarPorDni
};
