export default (sequelize, DataTypes) => {
	const Localidad = sequelize.define(
		'Localidad',
		{
			id_localidad: {
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
			tableName: 'localidad',
			timestamps: false,
		}
	);

	Localidad.associate = (models) => {
		Localidad.hasMany(models.Paciente, {
			foreignKey: 'id_localidad',
			as: 'pacientes',
		});
	};

	return Localidad;
};
