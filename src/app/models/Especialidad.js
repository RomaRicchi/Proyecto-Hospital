export default (sequelize, DataTypes) => {
	const Especialidad = sequelize.define(
		'Especialidad',
		{
			id_especialidad: {
				type: DataTypes.SMALLINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			nombre: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
		},
		{
			tableName: 'especialidad',
			timestamps: false,
		}
	);

	return Especialidad;
};
