export default (sequelize, DataTypes) => {
  const EstadoTurno = sequelize.define('estado_turno', {
    id_estado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    tableName: 'estado_turno',
    timestamps: false
  });

  return EstadoTurno;
};
