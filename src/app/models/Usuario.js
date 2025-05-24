export default (sequelize, DataTypes) => {
	const Usuario = sequelize.define(
		'Usuario',
		{
			id_usuario: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			username: {
				type: DataTypes.STRING(50),
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			estado: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'usuario',
			timestamps: false,
		}
	);

	return Usuario;
};
