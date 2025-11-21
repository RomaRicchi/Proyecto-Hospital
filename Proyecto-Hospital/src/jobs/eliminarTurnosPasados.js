import { Turno } from '../app/models/index.js'; 
import { Op } from 'sequelize';

export const eliminarTurnosPasados = async () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // truncar a 00:00

  const eliminados = await Turno.destroy({
    where: {
      fecha_hora: { [Op.lt]: hoy }
    }
  });

};
