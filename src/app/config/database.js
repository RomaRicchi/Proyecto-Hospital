import dotenv from 'dotenv';
dotenv.config();

export default {
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	host: process.env.DB_HOST,
	port: process.env.DB_PORT || 3306,
	dialect: 'mysql',
	logging: false,
	timezone: '-03:00',
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
		dateStrings: true,
		typeCast: true,
	},
};
