export default (sequelize, DataTypes) => {
	const Familiar = sequelize.define(
		'Familiar',
		{
			id_familiar: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			id_paciente: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
			},
			apellido: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			nombre: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			id_parentesco: {
				type: DataTypes.SMALLINT.UNSIGNED,
				allowNull: false,
			},
			telefono: {
				type: DataTypes.STRING(20),
				allowNull: true,
			},
			estado: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'familiar',
			timestamps: false,
		}
	);

	return Familiar;
};
