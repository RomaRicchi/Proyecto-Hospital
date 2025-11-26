export default (sequelize, DataTypes) => {
	const PersonalSalud = sequelize.define(
		'PersonalSalud',
		{
			id_personal_salud: {
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
			id_especialidad: {
				type: DataTypes.SMALLINT.UNSIGNED,
				allowNull: false,
			},
			matricula: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			activo: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'personal_salud',
			timestamps: false,
		}
	);

	// 🧩 Asociaciones
	PersonalSalud.associate = (models) => {
		PersonalSalud.belongsTo(models.Usuario, {
			foreignKey: 'id_usuario',
			as: 'usuario',
		});

		PersonalSalud.belongsTo(models.RolUsuario, {
			foreignKey: 'id_rol_usuario',
			as: 'rol',
		});

		PersonalSalud.belongsTo(models.Especialidad, {
			foreignKey: 'id_especialidad',
			as: 'especialidad',
		});
	};

	return PersonalSalud;
};
