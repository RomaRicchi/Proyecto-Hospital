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
				type: DataTypes.CHAR(1),
				allowNull: false,
				unique: true,
			},
		},
		{
			tableName: 'cama',
			timestamps: false,
		}
	);

	return Cama;
};
