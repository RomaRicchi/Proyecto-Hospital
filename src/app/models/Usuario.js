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
			email: {
				type: DataTypes.STRING(100),
				allowNull: true,
				unique: true,
				validate: {
					isEmail: true,
				},
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

	Usuario.associate = (models) => {
		Usuario.hasOne(models.PersonalSalud, {
			foreignKey: 'id_usuario',
			as: 'datos_medico',
		});
		Usuario.hasOne(models.PersonalAdministrativo, {
			foreignKey: 'id_usuario',
			as: 'personal_administrativo',
		});
	};

	return Usuario;
};
