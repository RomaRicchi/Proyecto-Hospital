export default {
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || 'CWrDqFHaxvJpmGdajfWBRwnQgLuvDFpL',
	database: process.env.DB_NAME || 'hospital_db',
	host: process.env.DB_HOST || 'hopper.proxy.rlwy.net',
	port: process.env.DB_PORT || 32611,
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
