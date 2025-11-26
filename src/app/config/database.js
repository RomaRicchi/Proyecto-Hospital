const useSSL = process.env.DB_SSL === 'true';

export default {
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'hospital_db',
	host: process.env.DB_HOST || '127.0.0.1',
	port: Number(process.env.DB_PORT) || 3306,
	dialect: 'mysql',
	
	logging: false,
	dialectOptions: {
		dateStrings: true,
		typeCast: true,
		...(useSSL && {
			ssl: {
				require: true,
				rejectUnauthorized: false
			}
		})
	}
};
