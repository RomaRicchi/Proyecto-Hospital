export default (sequelize, DataTypes) => {
  const Turno = sequelize.define('turno', {
    id_turno: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_agenda: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false
    },
    id_estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_motivo: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'turno',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Turno;
};
