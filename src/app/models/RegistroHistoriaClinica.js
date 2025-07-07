export default (sequelize, DataTypes) => {
	const RegistroHistoriaClinica = sequelize.define(
		'RegistroHistoriaClinica',
		{
			id_registro: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			id_admision: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
			},
			id_usuario: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
			},
			fecha_hora_reg: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			id_tipo: {
				type: DataTypes.INTEGER,
				allowNull: false,
			}, 
			detalle: {
				type: DataTypes.STRING(500),
				allowNull: false,
			},
			estado: {
				type: DataTypes.TINYINT,
				defaultValue: 1,
			},
		},
		{
			tableName: 'registro_historia_clinica',
			timestamps: false,
		}
	);

	return RegistroHistoriaClinica;
};
