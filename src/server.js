import dotenv from 'dotenv';
dotenv.config();

import app from './app/app.js'; // Importa la configuración de Express
import { sequelize } from './app/models/index.js'; // Importa Sequelize 

const PORT = process.env.PORT || 3000;

// 🌐 Conexión a la base de datos y arranque del servidor
(async () => {
	try {
		sequelize.sync(); //({ alter: true });
		console.log('✅ Base de datos conectada correctamente.');

		app.listen(PORT, () => {
			console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('❌ Error al conectar con la base de datos:', error);
	}
})();
