import pkg from 'sequelize';
const { Sequelize } = pkg;

import config from '../config/database.js';
const sequelize = new Sequelize(config);

// Importar modelos
import defineGenero from './Genero.js';
import defineLocalidad from './Localidad.js';
import definePaciente from './Paciente.js';
import defineFamiliar from './Familiar.js';
import defineParentesco from './Parentesco.js';
import defineObraSocial from './ObraSocial.js';
import defineUsuario from './Usuario.js';
import defineRolUsuario from './RolUsuario.js';
import definePersonalAdministrativo from './PersonalAdministrativo.js';
import definePersonalSalud from './PersonalSalud.js';
import defineEspecialidad from './Especialidad.js';
import defineSector from './Sector.js';
import defineHabitacion from './Habitacion.js';
import defineCama from './Cama.js';
import defineMovimiento from './Movimiento.js';
import defineMovimientoHabitacion from './MovimientoHabitacion.js';
import defineAdmision from './Admision.js';
import defineRegistroHistoriaClinica from './RegistroHistoriaClinica.js';
import defineMotivoIngreso from './MotivoIngreso.js';
import defineTipoRegistro from './TipoRegistro.js';

// Inicializar modelos
const Genero = defineGenero(sequelize, Sequelize.DataTypes);
const Localidad = defineLocalidad(sequelize, Sequelize.DataTypes);
const Paciente = definePaciente(sequelize, Sequelize.DataTypes);
const Familiar = defineFamiliar(sequelize, Sequelize.DataTypes);
const Parentesco = defineParentesco(sequelize, Sequelize.DataTypes);
const ObraSocial = defineObraSocial(sequelize, Sequelize.DataTypes);
const Usuario = defineUsuario(sequelize, Sequelize.DataTypes);
const RolUsuario = defineRolUsuario(sequelize, Sequelize.DataTypes);
const PersonalAdministrativo = definePersonalAdministrativo(
	sequelize,
	Sequelize.DataTypes
);
const PersonalSalud = definePersonalSalud(sequelize, Sequelize.DataTypes);
const Especialidad = defineEspecialidad(sequelize, Sequelize.DataTypes);
const Sector = defineSector(sequelize, Sequelize.DataTypes);
const Habitacion = defineHabitacion(sequelize, Sequelize.DataTypes);
const Cama = defineCama(sequelize, Sequelize.DataTypes);
const Movimiento = defineMovimiento(sequelize, Sequelize.DataTypes);
const MovimientoHabitacion = defineMovimientoHabitacion(
	sequelize,
	Sequelize.DataTypes
);
const Admision = defineAdmision(sequelize, Sequelize.DataTypes);
const RegistroHistoriaClinica = defineRegistroHistoriaClinica(
	sequelize,
	Sequelize.DataTypes
);
const MotivoIngreso = defineMotivoIngreso(sequelize, Sequelize.DataTypes);
const TipoRegistro = defineTipoRegistro(sequelize, Sequelize.DataTypes);

// Asociaciones internas (solo llama a associate si existe)
PersonalAdministrativo.associate?.({ Usuario, RolUsuario });
PersonalSalud.associate?.({ Usuario, RolUsuario, Especialidad });
Cama.associate?.({ Habitacion });
Habitacion.associate?.({ Sector, Cama, MovimientoHabitacion });
MovimientoHabitacion.associate?.({ Admision, Habitacion, Movimiento });

// Relaciones adicionales (solo las que no estén en associate)
Paciente.belongsTo(Genero, { foreignKey: 'id_genero', as: 'genero' });
Paciente.belongsTo(Localidad, { foreignKey: 'id_localidad', as: 'localidad' });
Paciente.hasMany(Familiar, { foreignKey: 'id_paciente', as: 'familiares' });
Paciente.hasMany(Admision, { foreignKey: 'id_paciente', as: 'admisiones' });

Familiar.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });
Familiar.belongsTo(Parentesco, {
	foreignKey: 'id_parentesco',
	as: 'parentesco',
});

Admision.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });
Admision.belongsTo(ObraSocial, {
	foreignKey: 'id_obra_social',
	as: 'obra_social',
});
Admision.belongsTo(Usuario, {
	foreignKey: 'id_personal_salud',
	as: 'personal_salud',
});
Admision.belongsTo(MotivoIngreso, {
	foreignKey: 'id_motivo',
	as: 'motivo_ingreso',
});
Admision.hasMany(MovimientoHabitacion, {
	foreignKey: 'id_admision',
	as: 'movimientos_habitacion',
});
Admision.hasMany(RegistroHistoriaClinica, {
	foreignKey: 'id_admision',
	as: 'registros_clinicos',
});

MovimientoHabitacion.belongsTo(Admision, {
	foreignKey: 'id_admision',
	as: 'admision_relacionada',
});
MovimientoHabitacion.belongsTo(Habitacion, {
	foreignKey: 'id_habitacion',
	as: 'habitacion_relacionada',
});
// MovimientoHabitacion.belongsTo(Movimiento, { foreignKey: 'id_mov', as: 'tipo_movimiento' }); // Solo si no está en associate

// Habitacion.belongsTo(Sector, { foreignKey: 'id_sector', as: 'sector' }); // Solo si no está en associate
// Habitacion.hasMany(Cama, { foreignKey: 'id_habitacion', as: 'camas' }); // Solo si no está en associate
// Habitacion.hasMany(MovimientoHabitacion, { foreignKey: 'id_habitacion', as: 'movimientos' }); // Solo si no está en associate

// Cama.belongsTo(Habitacion, { foreignKey: 'id_habitacion', as: 'habitacion' }); // Solo si no está en associate

RegistroHistoriaClinica.belongsTo(TipoRegistro, {
	foreignKey: 'id_tipo',
	as: 'tipo_registro',
});
RegistroHistoriaClinica.belongsTo(Admision, {
	foreignKey: 'id_admision',
	as: 'admision',
});
RegistroHistoriaClinica.belongsTo(Usuario, {
	foreignKey: 'id_usuario',
	as: 'usuario',
});

Usuario.hasOne(PersonalAdministrativo, {
	foreignKey: 'id_usuario',
	as: 'personal_administrativo',
});
Usuario.hasOne(PersonalSalud, {
	foreignKey: 'id_usuario',
	as: 'personal_salud',
});

// Exportar cada modelo explícitamente para evitar conflictos
export {
	sequelize,
	Sequelize,
	Genero,
	Localidad,
	Paciente,
	Familiar,
	Parentesco,
	ObraSocial,
	Usuario,
	RolUsuario,
	PersonalAdministrativo,
	PersonalSalud,
	Especialidad,
	Sector,
	Habitacion,
	Cama,
	Movimiento,
	MovimientoHabitacion,
	Admision,
	RegistroHistoriaClinica,
	MotivoIngreso,
	TipoRegistro,
};
