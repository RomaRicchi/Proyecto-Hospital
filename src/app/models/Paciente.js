export default (sequelize, DataTypes) => {
	const Paciente = sequelize.define(
		'Paciente',
		{
			id_paciente: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			dni_paciente: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			apellido_p: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			nombre_p: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			fecha_nac: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			id_genero: {
				type: DataTypes.TINYINT.UNSIGNED,
				allowNull: false,
			},
			telefono: {
				type: DataTypes.STRING(20),
				allowNull: true,
			},
			direccion: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			id_localidad: {
				type: DataTypes.SMALLINT.UNSIGNED,
				allowNull: true,
			},
			email: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			estado: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'paciente',
			timestamps: false,
		}
	);

	Paciente.associate = (models) => {
		Paciente.hasMany(models.Admision, {
			foreignKey: 'id_paciente',
			as: 'admisiones',
		});
		
	};

	return Paciente;
};
