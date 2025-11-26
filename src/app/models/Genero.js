export default (sequelize, DataTypes) => {
  const Genero = sequelize.define(
    'Genero',
    {
      id_genero: {
        type: DataTypes.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,  
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      tableName: 'genero',
      timestamps: false,
    }
  );

  Genero.associate = (models) => {
    Genero.hasMany(models.Paciente, {
      foreignKey: 'id_genero',
      as: 'pacientes',
    });
  };

  return Genero;
};
