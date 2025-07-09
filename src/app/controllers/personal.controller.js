import {
  PersonalSalud,
  PersonalAdministrativo,
  RolUsuario,
  Especialidad
} from '../models/index.js';

export const vistaPersonalSalud = async (req, res) => {
  try {
    const personal = await PersonalSalud.findAll({
      include: [
        { model: RolUsuario, as: 'rol' },
        { model: Especialidad, as: 'especialidad' }
      ],
      where: { activo: 1 }
    });
    res.render('salud', { personal });
  } catch (error) {
    res.status(500).send('Error al cargar personal de salud');
  }
};

export const vistaPersonalAdministrativo = async (req, res) => {
  try {
    const personal = await PersonalAdministrativo.findAll({
      include: [{ model: RolUsuario, as: 'rol' }],
      where: { activo: 1 }
    });
    res.render('administrativo', { personal });
  } catch (error) {
    res.status(500).send('Error al cargar personal administrativo');
  }
};

