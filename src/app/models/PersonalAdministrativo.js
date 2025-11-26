export default (sequelize, DataTypes) => {
	const PersonalAdministrativo = sequelize.define(
		'PersonalAdministrativo',
		{
			id_personal_admin: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			id_usuario: {
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
			id_rol_usuario: {
				type: DataTypes.TINYINT.UNSIGNED,
				allowNull: false,
			},
			activo: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'personal_administrativo',
			timestamps: false,
		}
	);

	PersonalAdministrativo.associate = (models) => {
		PersonalAdministrativo.belongsTo(models.Usuario, {
			foreignKey: 'id_usuario',
			as: 'usuario',
		});

		PersonalAdministrativo.belongsTo(models.RolUsuario, {
			foreignKey: 'id_rol_usuario',
			as: 'rol', 
		});
	};

	return PersonalAdministrativo;
};
