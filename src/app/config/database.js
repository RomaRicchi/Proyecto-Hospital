export default {
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'hospital_db',
	host: process.env.DB_HOST || '127.0.0.1',
	dialect: 'mysql', // o 'mariadb'
	logging: false,
};
