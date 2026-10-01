// Productos, categorías y colores (tablas productos, especificaciones,
// categorias, colores). Devuelve objetos planos con la misma forma que
// usan las vistas: p.categoria = "Línea Madera", p.color = "madera", etc.

const { Op } = require("sequelize");
const db = require("../model/database/models");

const STOCK_BAJO = 5;
const MAX_IMAGENES = 8;

// Valores por defecto para productos cargados sin ficha completa
const POR_DEFECTO = {
  cuotas: 6,
  resumen: "Prenda de la colección Matilda, con buenos tejidos y terminaciones cuidadas al detalle.",
  descripcion: ["Una prenda pensada para el día a día, fácil de combinar y cómoda de llevar."],
  destacados: ["Diseño exclusivo Matilda Boutique"],
};

const incluir = [
  { association: "categoria", attributes: ["id", "nombre"] },
  { association: "color", attributes: ["id", "valor", "nombre", "hex"] },
  { association: "imagenes", attributes: ["id", "ruta", "orden"] },
];

// Las fotos siempre ordenadas: la principal primero
const ordenImagenes = ["imagenes", "orden", "ASC"];

function plano(p) {
  if (!p) return null;
  const x = p.get({ plain: true });
  const parrafos = (texto) => (texto ? texto.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean) : null);
  const lineas = (texto) => (texto ? texto.split("\n").map((t) => t.trim()).filter(Boolean) : null);

  return {
    id: x.id,
    nombre: x.nombre,
    categoriaId: x.categoriaId,
    categoria: x.categoria?.nombre || "",
    colorId: x.colorId,
    color: x.color?.valor || "",
    colorInfo: x.color || null,
    precio: x.precio,
    costo: x.costo,
    stock: x.stock,
    etiqueta: x.etiqueta,
    talles: (x.talles || "").split(",").map((t) => t.trim()).filter(Boolean),
    // Lista de fotos [{ id, ruta }] y la principal suelta para tarjetas y carrito
    imagenes: (x.imagenes || []).sort((a, b) => a.orden - b.orden || a.id - b.id).map(({ id, ruta }) => ({ id, ruta })),
    imagen: (x.imagenes || []).sort((a, b) => a.orden - b.orden || a.id - b.id)[0]?.ruta || null,
    cuotas: POR_DEFECTO.cuotas,
    resumen: x.resumen || POR_DEFECTO.resumen,
    descripcion: parrafos(x.descripcion) || POR_DEFECTO.descripcion,
    destacados: lineas(x.destacados) || POR_DEFECTO.destacados,
    especificaciones: (x.especificaciones || []).sort((a, b) => a.orden - b.orden).map((e) => [e.clave, e.valor]),
  };
}

// ── Consultas ───────────────────────────────────────────────
async function listar({ q = "", categoria = "", stock = "", orden = "" } = {}) {
  const where = {};
  const texto = q.trim();
  if (texto) {
    // Busca en el nombre y en la categoría; un número busca también por código
    where[Op.or] = [
      { nombre: { [Op.like]: `%${texto}%` } },
      { "$categoria.nombre$": { [Op.like]: `%${texto}%` } },
      ...(/^\d+$/.test(texto) ? [{ id: Number(texto) }] : []),
    ];
  }
  if (stock === "sin") where.stock = 0;
  if (stock === "bajo") where.stock = { [Op.between]: [1, STOCK_BAJO] };

  const ordenes = {
    nombre: [["nombre", "ASC"]],
    "precio-desc": [["precio", "DESC"]],
    "stock-asc": [["stock", "ASC"]],
    "margen-desc": [[db.sequelize.literal("(precio - costo) / precio"), "DESC"]],
  };

  const filas = await db.Producto.findAll({
    where,
    include: [
      { ...incluir[0], ...(categoria ? { where: { nombre: categoria } } : {}) },
      incluir[1],
      incluir[2],
    ],
    order: [...(ordenes[orden] || [["id", "ASC"]]), ordenImagenes],
  });
  return filas.map(plano);
}

async function obtener(id) {
  const p = await db.Producto.findByPk(id, {
    include: [...incluir, { association: "especificaciones" }],
    order: [ordenImagenes],
  });
  return plano(p);
}

async function porIds(ids) {
  if (!ids.length) return [];
  const filas = await db.Producto.findAll({ where: { id: ids }, include: incluir, order: [ordenImagenes] });
  const mapa = new Map(filas.map((p) => [p.id, plano(p)]));
  return ids.map((id) => mapa.get(Number(id))).filter(Boolean);
}

async function relacionados(id, cantidad = 4) {
  const actual = await db.Producto.findByPk(id);
  if (!actual) return [];
  const filas = await db.Producto.findAll({
    where: { id: { [Op.ne]: actual.id } },
    include: incluir,
    // Primero los de la misma categoría
    order: [[db.sequelize.literal(`categoria_id = ${Number(actual.categoriaId)}`), "DESC"], ["id", "ASC"]],
  });
  return filas.map(plano).slice(0, cantidad);
}

async function categorias() {
  const filas = await db.Categoria.findAll({ order: [["orden", "ASC"]] });
  return filas.map((c) => c.nombre);
}

async function colores() {
  const filas = await db.Color.findAll({ order: [["orden", "ASC"]], raw: true });
  return filas.map(({ valor, nombre, hex }) => ({ valor, nombre, hex }));
}

async function resumenStock() {
  const [fila] = await db.sequelize.query(
    `SELECT COALESCE(SUM(stock), 0) AS unidades,
            COALESCE(SUM(stock * costo), 0) AS valorCosto,
            COALESCE(SUM(stock * precio), 0) AS valorVenta
       FROM productos`,
    { type: db.Sequelize.QueryTypes.SELECT }
  );
  const alertas = await db.Producto.findAll({
    where: { stock: { [Op.lte]: STOCK_BAJO } },
    include: incluir,
    order: [["stock", "ASC"], ordenImagenes],
  });
  const lista = alertas.map(plano);
  return {
    unidades: Number(fila.unidades),
    valorCosto: Number(fila.valorCosto),
    valorVenta: Number(fila.valorVenta),
    sinStock: lista.filter((p) => p.stock === 0),
    bajo: lista.filter((p) => p.stock > 0),
  };
}

// Las últimas prendas cargadas que tienen stock (para el inicio)
async function novedades(cantidad = 4) {
  const filas = await db.Producto.findAll({
    where: { stock: { [Op.gt]: 0 } },
    attributes: ["id"],
    include: [{ association: "imagenes", attributes: ["id"] }],
    order: [["id", "DESC"]],
  });
  // Primero las que tienen foto (se ven mejor en el inicio), después el resto
  const ids = [...filas.filter((f) => f.imagenes.length), ...filas.filter((f) => !f.imagenes.length)]
    .slice(0, cantidad)
    .map((f) => f.id);
  return porIds(ids);
}

async function total() {
  return db.Producto.count();
}

// "s, m ,xl" → "S,M,XL" (sin repetidos; vacío = talle único)
function normalizarTalles(texto) {
  const lista = [...new Set(String(texto || "").split(/[,\s]+/).map((t) => t.trim().toUpperCase()).filter(Boolean))];
  return lista.length ? lista.slice(0, 12).join(",").slice(0, 80) : null;
}

// ── ABM (panel admin) ───────────────────────────────────────
// datos.categoria es el nombre y datos.color el valor ("negro"), como en el formulario
async function datosParaGuardar(datos) {
  const [categoria, color] = await Promise.all([
    db.Categoria.findOne({ where: { nombre: datos.categoria } }),
    db.Color.findOne({ where: { valor: datos.color } }),
  ]);
  return {
    nombre: String(datos.nombre).trim(),
    categoriaId: categoria.id,
    colorId: color.id,
    precio: Number(datos.precio),
    costo: Number(datos.costo),
    stock: Math.max(0, parseInt(datos.stock, 10) || 0),
    etiqueta: String(datos.etiqueta || "").trim() || null,
    talles: normalizarTalles(datos.talles),
  };
}

// Guarda las fotos del producto.
//   nuevas:    rutas de los archivos recién subidos (en el orden elegido)
//   quitar:    ids de fotos existentes a borrar
//   principal: "e-<id>" (una existente) o "n-<índice>" (una nueva)
// Devuelve las rutas borradas para eliminar los archivos del disco.
async function guardarImagenes(productoId, { nuevas = [], quitar = [], principal = "" } = {}, t) {
  const existentes = await db.ProductoImagen.findAll({
    where: { productoId },
    order: [["orden", "ASC"], ["id", "ASC"]],
    transaction: t,
  });
  const idsQuitar = new Set(quitar.map(Number));
  const borradas = existentes.filter((i) => idsQuitar.has(i.id));
  if (borradas.length) {
    await db.ProductoImagen.destroy({ where: { id: borradas.map((i) => i.id) }, transaction: t });
  }

  const quedan = existentes.filter((i) => !idsQuitar.has(i.id));
  const creadas = [];
  for (const [n, ruta] of nuevas.entries()) {
    creadas.push({ clave: `n-${n}`, fila: await db.ProductoImagen.create({ productoId, ruta, orden: 999 }, { transaction: t }) });
  }

  // Orden final: la principal primero, después el resto como estaban
  const todas = [...quedan.map((fila) => ({ clave: `e-${fila.id}`, fila })), ...creadas];
  const i = todas.findIndex((x) => x.clave === principal);
  if (i > 0) todas.unshift(...todas.splice(i, 1));
  for (const [orden, { fila }] of todas.entries()) {
    if (fila.orden !== orden) await fila.update({ orden }, { transaction: t });
  }

  return borradas.map((i) => i.ruta);
}

async function contarImagenes(productoId) {
  return productoId ? db.ProductoImagen.count({ where: { productoId } }) : 0;
}

async function crear(datos, imagenes = {}) {
  const id = await db.sequelize.transaction(async (t) => {
    const producto = await db.Producto.create(await datosParaGuardar(datos), { transaction: t });
    await guardarImagenes(producto.id, imagenes, t);
    return producto.id;
  });
  return obtener(id);
}

// Devuelve { producto, rutasBorradas }
async function actualizar(id, datos, imagenes = {}) {
  const producto = await db.Producto.findByPk(id);
  if (!producto) return null;
  const rutasBorradas = await db.sequelize.transaction(async (t) => {
    await producto.update(await datosParaGuardar(datos), { transaction: t });
    return guardarImagenes(producto.id, imagenes, t);
  });
  return { producto: await obtener(id), rutasBorradas };
}

async function eliminar(id) {
  const producto = await obtener(id);
  if (!producto) return null;
  await db.Producto.destroy({ where: { id } });
  return producto;
}

// cambio: suma/resta; valor: fija el número exacto. Nunca queda negativo.
async function ajustarStock(id, { cambio, valor }) {
  const producto = await db.Producto.findByPk(id);
  if (!producto) return null;
  const nuevo = valor !== undefined ? valor : producto.stock + cambio;
  await producto.update({ stock: Math.max(0, nuevo) });
  return producto.stock;
}

module.exports = {
  STOCK_BAJO,
  novedades,
  MAX_IMAGENES,
  contarImagenes,
  listar,
  obtener,
  porIds,
  relacionados,
  categorias,
  colores,
  resumenStock,
  total,
  crear,
  actualizar,
  eliminar,
  ajustarStock,
};
