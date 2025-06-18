export default {
	username: 'root',
	password: 'CWrDqFHaxvJpmGdajfWBRwnQgLuvDFpL',
	database: 'railway',
	host: 'mysql-z9hz.railway.internal',
	port: 3306,
	dialect: 'mysql',
	logging: false,
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
};
