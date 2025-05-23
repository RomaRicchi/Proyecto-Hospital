const connection = require('../bd');

// Mostrar camas
const listarCamas = (req, res) => {
  connection.query('SELECT * FROM habitacion WHERE estado = 1', (err, camas) => {
    if (err) {
      console.error('Error al listar camas:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.render('camas', { camas });
  });
};

// Crear nueva cama
const crearCama = (req, res) => {
  const { sector, num, cama } = req.body;
  connection.query('INSERT INTO habitacion (sector, num, cama, estado) VALUES (?, ?, ?, 1)', [sector, num, cama], (err) => {
    if (err) {
      console.error('Error al crear cama:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.redirect('/camas');
  });
};

// Editar cama
const editarCama = (req, res) => {
  const id = req.params.id;
  const { sector, num, cama } = req.body;
  connection.query('UPDATE habitacion SET sector = ?, num = ?, cama = ? WHERE id_habitacion = ?', [sector, num, cama, id], (err) => {
    if (err) {
      console.error('Error al editar cama:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.redirect('/camas');
  });
};

// Eliminar cama (baja lógica)
const eliminarCama = (req, res) => {
  const id = req.params.id;
  connection.query('UPDATE habitacion SET estado = 0 WHERE id_habitacion = ?', [id], (err) => {
    if (err) {
      console.error('Error al eliminar cama:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.redirect('/camas');
  });
};

const formularioEditarCama = (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM habitacion WHERE id_habitacion = ?', [id], (err, resultado) => {
    if (err) {
      console.error('Error al obtener cama:', err);
      return res.status(500).send('Error al cargar formulario');
    }
    if (resultado.length === 0) {
      return res.status(404).send('Cama no encontrada');
    }
    res.render('editarCama', { cama: resultado[0] });
  });
};


module.exports = {
  listarCamas,
  crearCama,
  editarCama,
  eliminarCama,
  formularioEditarCama
};
