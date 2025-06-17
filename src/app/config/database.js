export default {
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'hospital_db',
	host: process.env.DB_HOST || '127.0.0.1',
	port: process.env.DB_PORT || 3306,
	dialect: 'mysql',
	logging: false,
	timezone: '-03:00', // 📍 Ajuste a hora de Argentina
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
		dateStrings: true,
		typeCast: true,
	},
};
