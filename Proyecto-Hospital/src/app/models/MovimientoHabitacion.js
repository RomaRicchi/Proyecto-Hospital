export default (sequelize, DataTypes) => {
	const MovimientoHabitacion = sequelize.define(
		'MovimientoHabitacion',
		{
			id_movimiento: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			id_admision: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
			},
			id_habitacion: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
			},
			id_cama: {
				type: DataTypes.TINYINT.UNSIGNED,
				allowNull: false,
			},
			fecha_hora_ingreso: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			fecha_hora_egreso: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			id_mov: {
				type: DataTypes.SMALLINT.UNSIGNED,
				allowNull: false,
			},
			estado: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: 1,
			},
		},
		{
			tableName: 'movimiento_habitacion',
			timestamps: false,
		}
	);

	MovimientoHabitacion.associate = (models) => {
		MovimientoHabitacion.belongsTo(models.Habitacion, {
			foreignKey: 'id_habitacion',
			as: 'habitacion',
		});
		MovimientoHabitacion.belongsTo(models.Cama, {
			foreignKey: 'id_cama',
			as: 'cama',
		});
		MovimientoHabitacion.belongsTo(models.Admision, {
			foreignKey: 'id_admision',
			as: 'admision',
		});
		MovimientoHabitacion.belongsTo(models.Movimiento, {
			foreignKey: 'id_mov',
			as: 'tipo_movimiento',
		});
		MovimientoHabitacion.belongsTo(models.Admision, {
			foreignKey: 'id_admision',
			as: 'admision_relacionada', 
		});

	};

	return MovimientoHabitacion;
};
