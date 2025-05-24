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
			desinfeccion: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			estado: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'movimiento_habitacion',
			timestamps: false,
		}
	);

	return MovimientoHabitacion;
};
