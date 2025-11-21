export default (sequelize, DataTypes) => {
	const Cama = sequelize.define(
		'Cama',
		{
			id_cama: {
				type: DataTypes.TINYINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			nombre: {
				type: DataTypes.STRING(1),
				allowNull: false,
			},
			id_habitacion: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
			},
			desinfeccion: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			estado: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
		},
		{
			tableName: 'cama',
			timestamps: false,
		}
	);


	Cama.associate = (models) => {
	
		Cama.belongsTo(models.Habitacion, {
			foreignKey: 'id_habitacion',
			as: 'habitacion',
		});

		Cama.hasMany(models.MovimientoHabitacion, {
			foreignKey: 'id_cama',
			as: 'movimientos'
		});
	};


	return Cama;
};
