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
    id_obra_social: {
      type: DataTypes.SMALLINT,
      allowNull: true
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
    timestamps: false
  });
  Turno.associate = (models) => {
    Turno.belongsTo(models.Agenda, {
      foreignKey: 'id_agenda',
      as: 'agenda'
    });

    Turno.belongsTo(models.Paciente, {
      foreignKey: 'id_paciente',
      as: 'cliente'
    });

    Turno.belongsTo(models.EstadoTurno, {
      foreignKey: 'id_estado',
      as: 'estado_turno'
    });

    Turno.belongsTo(models.MotivoIngreso, {
      foreignKey: 'id_motivo',
      as: 'motivo_turno'
    });

    Turno.belongsTo(models.ObraSocial, {
      foreignKey: 'id_obra_social',
      as: 'obra_social'
    });

  };


  return Turno;
};
