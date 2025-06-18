export default {
	username: 'root',
	password: 'CWrDqFHaxvJpmGdajfWBRwnQgLuvDFpL',
	database: 'railway',
	host: 'mysql-z9hz.railway.internal',
	port: 3306,
	dialect: 'mysql',
	logging: false,
	timezone: '-03:00', // Hora de Argentina
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
		dateStrings: true,
		typeCast: true,
	},
};
