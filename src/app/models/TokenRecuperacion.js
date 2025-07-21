export default (sequelize, DataTypes) => {
  const TokenRecuperacion = sequelize.define('TokenRecuperacion', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    expiracion: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'token_recuperacion',
    timestamps: false
  });

  TokenRecuperacion.associate = (models) => {
    TokenRecuperacion.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });
  };

  return TokenRecuperacion;
};
