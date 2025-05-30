export default (sequelize, DataTypes) => {
	const Parentesco = sequelize.define(
		'Parentesco',
		{
			id_parentesco: {
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
			tableName: 'parentesco',
			timestamps: false,
		}
	);

	Parentesco.associate = (models) => {
		Parentesco.hasMany(models.Familiar, {
			foreignKey: 'id_parentesco',
			as: 'familiares',
		});
	};

	return Parentesco;
};
