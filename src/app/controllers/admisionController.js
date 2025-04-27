const admisionModel = require('../models/admisionModel');

// Vista del formulario de admisión
const vistaFormulario = (req, res) => {
  res.render('admisiones'); // Debe existir admisiones.pug
};

// Crear internación y asignar cama
const crearInternacion = (req, res) => {
  const { id_paciente, id_habitacion, id_cama } = req.body;

  if (!id_paciente || !id_habitacion || !id_cama) {
    return res.status(400).send('Faltan datos para la internación');
  }

  // Paso 1: crear admisión
  admisionModel.crearInternacion(id_paciente, (err, id_admision) => {
    if (err) return res.status(500).send('Error al crear internación');

    // Paso 2: asignar cama
    admisionModel.asignarCama(id_admision, id_habitacion, id_cama, (err2) => {
      if (err2) return res.status(500).send('Error al asignar cama');

      res.redirect('/pacientes'); // O redirigí donde prefieras
    });
  });
};

module.exports = {
  vistaFormulario,
  crearInternacion
};
