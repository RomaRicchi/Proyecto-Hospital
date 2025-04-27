const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // si tenés clave en XAMPP o WAMP, ponela acá
  database: 'hospital_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos hospital_db');
});

module.exports = connection;
