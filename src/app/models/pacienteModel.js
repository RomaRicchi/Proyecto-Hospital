
// src/app/models/pacienteModel.js
const connection = require('../../config/db'); // o ajustá al path real

const listarPacientes = (callback) => {
  const sql = `
    SELECT 
      p.id_paciente,
      p.dni_paciente,
      p.nombre_p,
      p.apellido_p,
      p.fecha_nac,
      p.genero,
      p.cobertura,
      h.id_habitacion,
      h.sector,
      c.numero AS cama
    FROM paciente p
    LEFT JOIN admision a ON p.id_paciente = a.id_paciente AND a.estado = 1
    LEFT JOIN habitacion h ON a.id_habitacion = h.id_habitacion
    LEFT JOIN cama c ON a.id_cama = c.id_cama;
  `;

  connection.query(sql, (err, resultados) => {
    if (err) {
      console.error('❌ Error al obtener pacientes:', err);
      callback(err, null);
    } else {
      callback(null, resultados);
    }
  });
};

module.exports = {
  listarPacientes
};
