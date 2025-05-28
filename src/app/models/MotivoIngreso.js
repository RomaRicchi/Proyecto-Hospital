export default (sequelize, DataTypes) => {
	const MotivoIngreso = sequelize.define(
		'MotivoIngreso',
		{
			id_motivo: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			tipo: { type: DataTypes.STRING(50), allowNull: false },
		},
		{
			tableName: 'motivo_ingreso',
			timestamps: false,
		}
	);

	return MotivoIngreso;
};
