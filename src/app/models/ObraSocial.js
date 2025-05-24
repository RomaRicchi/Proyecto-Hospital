export default (sequelize, DataTypes) => {
	const ObraSocial = sequelize.define(
		'ObraSocial',
		{
			id_obra_social: {
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
			tableName: 'obra_social',
			timestamps: false,
		}
	);

	return ObraSocial;
};
