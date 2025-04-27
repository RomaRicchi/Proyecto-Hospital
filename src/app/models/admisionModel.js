// src/app/models/admisionModel.js
const db = require('../bd'); 

const crearInternacion = (id_paciente, callback) => {
  const sql = `
    INSERT INTO admision (id_paciente, fecha_ingreso, estado)
    VALUES (?, NOW(), 1);
  `;

  connection.query(sql, [id_paciente], (err, result) => {
    if (err) {
      console.error('❌ Error al crear internación:', err);
      return callback(err, null);
    }
    callback(null, result.insertId); // Devuelve el ID de la admisión recién creada
  });
};

const asignarCama = (id_admision, id_habitacion, id_cama, callback) => {
  const sql = `
    INSERT INTO movimiento_habitacion (id_admision, id_habitacion, id_cama, fecha_movimiento, estado)
    VALUES (?, ?, ?, NOW(), 1);
  `;

  connection.query(sql, [id_admision, id_habitacion, id_cama], (err, result) => {
    if (err) {
      console.error('❌ Error al asignar cama:', err);
      return callback(err, null);
    }
    callback(null, result.insertId);
  });
};

module.exports = {
  crearInternacion,
  asignarCama
};
