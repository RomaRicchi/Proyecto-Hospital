import cron from 'node-cron';
import { Turno, Agenda } from '../app/models/index.js';
import { eliminarTurnosPasados } from './eliminarTurnosPasados.js';

export function iniciarActualizacionTurnos() {
  // ⏱ Cada 5 minutos: actualizar estado de turnos pasados a "atendido"
  cron.schedule('*/30 * * * *', async () => {
    const ahora = new Date();
    console.log('⏳ Verificando turnos vencidos...');

    try {
      const turnos = await Turno.findAll({
        where: { id_estado: 1 }, // pendiente
        include: [{ model: Agenda, as: 'agenda' }]
      });

      for (const turno of turnos) {
        const inicio = new Date(turno.fecha_hora);
        const duracion = turno.agenda?.duracion || 30;
        const fin = new Date(inicio.getTime() + duracion * 60000);

        if (ahora >= fin) {
          await turno.update({ id_estado: 2 }); // atendido
          console.log(`✅ Turno ${turno.id_turno} marcado como atendido`);
        }
      }
    } catch (error) {
      console.error('❌ Error al actualizar turnos automáticamente:', error);
    }
  });

  // 🧹 Una vez a la semana a la 01:00 AM: eliminar turnos pasados
  cron.schedule('0 2 * * 0', async () => {
    try {
      await eliminarTurnosPasados();
    } catch (error) {
      console.error('❌ Error al eliminar turnos pasados:', error);
    }
  });
}
