export default (sequelize, DataTypes) => {
	const RolUsuario = sequelize.define(
		'RolUsuario',
		{
			id_rol_usuario: {
				type: DataTypes.TINYINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			nombre: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
		},
		{
			tableName: 'rol_usuario',
			timestamps: false,
		}
	);

	return RolUsuario;
};
