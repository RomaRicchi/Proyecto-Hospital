export default (sequelize, DataTypes) => {
	const Sector = sequelize.define(
		'Sector',
		{
			id_sector: {
				type: DataTypes.SMALLINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			nombre: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
		},
		{
			tableName: 'sector',
			timestamps: false,
		}
	);

	return Sector;
};
