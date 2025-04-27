const mysql = require('mysql');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital_db'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos hospital_db');
  }
});

module.exports = connection;
