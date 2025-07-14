export default (sequelize, DataTypes) => {
  const Agenda = sequelize.define('agenda', {
    id_agenda: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_personal_salud: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_dia: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_turno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: 'agenda',
    timestamps: false
  });

  return Agenda;
};
