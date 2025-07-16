import cron from 'node-cron';
import { eliminarReservasVencidas } from '../app/controllers/confirmarReserva.controller.js';

export function iniciarEliminacionReservas() {
  // Ejecutar todos los días a la 1 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('🧹 Ejecutando eliminación de reservas vencidas...');

    try {
      await eliminarReservasVencidas(
        {}, // req simulado
        { 
          json: msg => console.log('✅', msg),
          status: code => ({ json: err => console.error(`❌ ${code}:`, err) })
        } // res simulado
      );
    } catch (error) {
      console.error('❌ Error al ejecutar cron:', error.message);
    }
  });
}
