import cron from 'node-cron';
import { Turno, Agenda } from '../app/models/index.js';

export function iniciarActualizacionTurnos() {
  // Ejecutar cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    const ahora = new Date();
      console.log('⏳ Ejecutando cron de actualización de turnos...');

    try {
      const turnos = await Turno.findAll({
        where: { id_estado: 1 }, // 1 = pendiente
        include: [{ model: Agenda, as: 'agenda' }]
      });

      for (const turno of turnos) {
        const inicio = new Date(turno.fecha_hora);
        const duracion = turno.agenda?.duracion || 30; // minutos
        const fin = new Date(inicio.getTime() + duracion * 60000);

        if (ahora >= fin) {
          await turno.update({ id_estado: 2 }); // 2 = atendido
          console.log(`✅ Turno ${turno.id_turno} marcado como atendido`);
        }
      }
    } catch (error) {
      console.error('❌ Error al actualizar turnos automáticamente:', error);
    }
  });
}
