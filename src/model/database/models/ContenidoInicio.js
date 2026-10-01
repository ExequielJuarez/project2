// Contenido editable de la página de inicio (una sola fila, id = 1).
// "datos" guarda el contenido en JSON; si falta algo (por ejemplo un
// campo nuevo) se completa con el original de src/data/inicioEditable.js
module.exports = (sequelize, DataTypes) => {
  const ContenidoInicio = sequelize.define(
    "ContenidoInicio",
    {
      id: { type: DataTypes.TINYINT.UNSIGNED, primaryKey: true, defaultValue: 1 },
      datos: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        get() {
          try {
            return JSON.parse(this.getDataValue("datos") || "{}");
          } catch {
            return {};
          }
        },
        set(valor) {
          this.setDataValue("datos", JSON.stringify(valor));
        },
      },
      usuarioId: DataTypes.INTEGER.UNSIGNED,
    },
    { tableName: "contenido_inicio", createdAt: false }
  );

  ContenidoInicio.associate = (db) => {
    ContenidoInicio.belongsTo(db.Usuario, { as: "editor", foreignKey: "usuarioId", onDelete: "SET NULL" });
  };

  return ContenidoInicio;
};
