export default (sequelize, DataTypes) => {
  const Agenda = sequelize.define('Agenda', {
    id_agenda: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_personal_salud: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_dia: {
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
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'agenda',
    timestamps: false
  });

  Agenda.associate = (models) => {
    Agenda.belongsTo(models.PersonalSalud, {
      foreignKey: 'id_personal_salud',
      as: 'personal'
    });
    Agenda.belongsTo(models.Dia, {
      foreignKey: 'id_dia',
      as: 'dia'
    });
  };

  return Agenda;
};
