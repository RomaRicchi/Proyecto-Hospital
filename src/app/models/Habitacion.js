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
		},
		{
			tableName: 'habitacion',
			timestamps: false,
		}
	);

	Habitacion.associate = (models) => {
		Habitacion.hasMany(models.Cama, {
			foreignKey: 'id_habitacion',
			as: 'camas',
		});

		Habitacion.belongsTo(models.Sector, {
			foreignKey: 'id_sector',
			as: 'sector',
			onDelete: 'RESTRICT'
		});

		Habitacion.hasMany(models.MovimientoHabitacion, {
			foreignKey: 'id_habitacion',
			as: 'movimientos',
		});
	};

	return Habitacion;
};
