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
const PersonalAdministrativo = definePersonalAdministrativo(sequelize, Sequelize.DataTypes);
const PersonalSalud = definePersonalSalud(sequelize, Sequelize.DataTypes);
const Especialidad = defineEspecialidad(sequelize, Sequelize.DataTypes);
const Sector = defineSector(sequelize, Sequelize.DataTypes);
const Habitacion = defineHabitacion(sequelize, Sequelize.DataTypes);
const Cama = defineCama(sequelize, Sequelize.DataTypes);
const Movimiento = defineMovimiento(sequelize, Sequelize.DataTypes);
const MovimientoHabitacion = defineMovimientoHabitacion(sequelize, Sequelize.DataTypes);
const Admision = defineAdmision(sequelize, Sequelize.DataTypes);
const RegistroHistoriaClinica = defineRegistroHistoriaClinica(sequelize, Sequelize.DataTypes);
const MotivoIngreso = defineMotivoIngreso(sequelize, Sequelize.DataTypes);
const TipoRegistro = defineTipoRegistro(sequelize, Sequelize.DataTypes);


PersonalAdministrativo.associate?.({ Usuario, RolUsuario });
PersonalSalud.associate?.({ Usuario, RolUsuario, Especialidad });
Cama.associate?.({ Habitacion, MovimientoHabitacion });
Habitacion.associate?.({ Sector, Cama, MovimientoHabitacion });
MovimientoHabitacion.associate?.({ Admision, Habitacion, Movimiento, Cama });
Admision.associate?.({
	Paciente,
	ObraSocial,
	Usuario,
	MotivoIngreso,
	MovimientoHabitacion,
	RegistroHistoriaClinica,
});

Paciente.belongsTo(Genero, { foreignKey: 'id_genero', as: 'genero' });
Paciente.belongsTo(Localidad, { foreignKey: 'id_localidad', as: 'localidad' });
Paciente.hasMany(Familiar, { foreignKey: 'id_paciente', as: 'familiares' });
Paciente.hasMany(Admision, { foreignKey: 'id_paciente', as: 'admisiones' });

Familiar.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });
Familiar.belongsTo(Parentesco, { foreignKey: 'id_parentesco', as: 'parentesco' });

MovimientoHabitacion.belongsTo(Habitacion, {	foreignKey: 'id_habitacion',	as: 'habitacion_relacionada'});

RegistroHistoriaClinica.belongsTo(TipoRegistro, {	foreignKey: 'id_tipo',	as: 'tipo_registro'});
RegistroHistoriaClinica.belongsTo(Admision, {	foreignKey: 'id_admision',	as: 'admision_historia'});
RegistroHistoriaClinica.belongsTo(Usuario, { foreignKey: 'id_usuario',	as: 'usuario'});

Admision.belongsTo(Paciente, { as: 'paciente_admision', foreignKey: 'id_paciente' });
Admision.belongsTo(Usuario, { as: 'usuario_medico', foreignKey: 'id_usuario' });

Usuario.hasOne(PersonalAdministrativo, { foreignKey: 'id_usuario',	as: 'personal_administrativo'});
Usuario.hasOne(PersonalSalud, {  foreignKey: 'id_usuario',  as: 'datos_medico'});

PersonalSalud.belongsTo(Usuario, {  foreignKey: 'id_usuario',  as: 'datos_usuario'});

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
