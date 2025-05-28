export default (sequelize, DataTypes) => {
	const Admision = sequelize.define(
		'Admision',
		{
			id_admision: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			id_paciente: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
			},
			id_obra_social: {
				type: DataTypes.SMALLINT.UNSIGNED,
				allowNull: false,
			},
			num_asociado: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			fecha_hora_ingreso: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			id_motivo: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			descripcion: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			fecha_hora_egreso: { type: DataTypes.DATE, allowNull: true },
			motivo_egr: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			id_personal_salud: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
			},
		},
		{
			tableName: 'admision',
			timestamps: false,
		}
	);

	return Admision;
};
