module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define(
    "Producto",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(90), allowNull: false },
      categoriaId: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
      colorId: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
      precio: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0.01 } },
      costo: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
      stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      etiqueta: DataTypes.STRING(24),
      talles: DataTypes.STRING(80), // talles disponibles separados por coma: "S,M,L,XL" (vacío = talle único)
      resumen: DataTypes.STRING(255),
      descripcion: DataTypes.TEXT, // párrafos separados por una línea en blanco
      destacados: DataTypes.TEXT, // un punto por línea
    },
    { tableName: "productos" }
  );

  Producto.associate = (db) => {
    Producto.belongsTo(db.Categoria, { as: "categoria", foreignKey: "categoriaId" });
    Producto.belongsTo(db.Color, { as: "color", foreignKey: "colorId" });
    Producto.hasMany(db.Especificacion, { as: "especificaciones", foreignKey: "productoId" });
    Producto.hasMany(db.ProductoImagen, { as: "imagenes", foreignKey: "productoId" });
    Producto.hasMany(db.PedidoItem, { as: "ventas", foreignKey: "productoId" });
    Producto.belongsToMany(db.Usuario, {
      as: "guardadoPor",
      through: db.Favorito,
      foreignKey: "productoId",
      otherKey: "usuarioId",
    });
  };

  return Producto;
};
