export default (sequelize, DataTypes) => {
	const Habitacion = sequelize.define(
		'Habitacion',
		{
			id_habitacion: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			id_sector: {
				type: DataTypes.SMALLINT.UNSIGNED,
				allowNull: true,
			},
			num: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			id_cama: {
				type: DataTypes.TINYINT.UNSIGNED,
				allowNull: true,
			},
			estado: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'habitacion',
			timestamps: false,
		}
	);

	return Habitacion;
};
