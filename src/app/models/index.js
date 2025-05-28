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

// Ejecutar asociaciones desde modelos que las tienen definidas internamente
PersonalAdministrativo.associate?.({
	RolUsuario,
	Usuario,
});
PersonalSalud.associate?.({
	RolUsuario,
	Usuario,
	Especialidad,
});

// Relaciones PACIENTE
Paciente.belongsTo(Genero, { foreignKey: 'id_genero', as: 'genero' });
Paciente.belongsTo(Localidad, { foreignKey: 'id_localidad', as: 'localidad' });
Paciente.hasMany(Familiar, { foreignKey: 'id_paciente', as: 'familiares' });
Paciente.hasMany(Admision, { foreignKey: 'id_paciente', as: 'admisiones' });

// Relaciones FAMILIAR
Familiar.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });
Familiar.belongsTo(Parentesco, {
	foreignKey: 'id_parentesco',
	as: 'parentesco',
});

// Relaciones ADMISION
Admision.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });
Admision.belongsTo(ObraSocial, {
	foreignKey: 'id_obra_social',
	as: 'obra_social',
});
Admision.belongsTo(Usuario, {
	foreignKey: 'id_personal_admin',
	as: 'personal_admin',
});
Admision.belongsTo(Usuario, {
	foreignKey: 'id_personal_salud',
	as: 'personal_salud',
});
Admision.hasMany(MovimientoHabitacion, {
	foreignKey: 'id_admision',
	as: 'movimientos',
});
Admision.hasMany(RegistroHistoriaClinica, {
	foreignKey: 'id_admision',
	as: 'registros_clinicos',
});
Admision.belongsTo(MotivoIngreso, { foreignKey: 'id_motivo', as: 'motivo' });
RegistroHistoriaClinica.belongsTo(TipoRegistro, {
	foreignKey: 'id_tipo',
	as: 'tipo_registro',
});

// Relaciones MOVIMIENTO_HABITACION
MovimientoHabitacion.belongsTo(Admision, {
	foreignKey: 'id_admision',
	as: 'admision',
});
MovimientoHabitacion.belongsTo(Habitacion, {
	foreignKey: 'id_habitacion',
	as: 'habitacion',
});
MovimientoHabitacion.belongsTo(Movimiento, {
	foreignKey: 'id_mov',
	as: 'tipo_movimiento',
});

// Relaciones HABITACION
Habitacion.belongsTo(Sector, { foreignKey: 'id_sector', as: 'sector' });
Habitacion.belongsTo(Cama, { foreignKey: 'id_cama', as: 'cama' });
Habitacion.hasMany(MovimientoHabitacion, {
	foreignKey: 'id_habitacion',
	as: 'movimientos',
});

// Relaciones REGISTRO HISTORIA CLÍNICA
RegistroHistoriaClinica.belongsTo(Admision, {
	foreignKey: 'id_admision',
	as: 'admision',
});
RegistroHistoriaClinica.belongsTo(Usuario, {
	foreignKey: 'id_usuario',
	as: 'usuario',
});

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
