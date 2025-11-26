export default (sequelize, DataTypes) => {
	const TipoRegistro = sequelize.define(
		'TipoRegistro',
		{
			id_tipo: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			nombre: { type: DataTypes.STRING(70), allowNull: false },
		},
		{
			tableName: 'tipo_registro',
			timestamps: false,
		}
	);

	return TipoRegistro;
};
