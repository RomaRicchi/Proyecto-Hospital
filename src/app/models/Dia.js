export default (sequelize, DataTypes) => {
  const Dia = sequelize.define('dia_semana', {
    id_dia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(15),
      allowNull: false
    }
  }, {
    tableName: 'dia_semana',
    timestamps: false
  });

  return Dia;
};
