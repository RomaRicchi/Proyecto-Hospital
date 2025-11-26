export default (sequelize, DataTypes) => {
	const Movimiento = sequelize.define(
		'Movimiento',
		{
			id_mov: {
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
			tableName: 'movimiento',
			timestamps: false,
		}
	);

	return Movimiento;
};
