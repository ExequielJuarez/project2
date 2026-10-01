const favoritos = require("../services/favoritoService");
const carrito = require("../services/carritoService");

module.exports = {
  async ver(req, res) {
    res.render("favoritos", {
      titulo: "Favoritos",
      estilo: "favoritos",
      productos: await favoritos.productos(req.session),
    });
  },

  async alternar(req, res) {
    const r = await favoritos.alternar(req.session, req.params.id);
    if (!r) return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
    res.json({ ok: true, ...r });
  },

  async vaciar(req, res) {
    await favoritos.vaciar(req.session);
    res.json({ ok: true, cantidad: 0 });
  },

  // Agrega al carrito todos los favoritos que tengan stock
  async alCarrito(req, res) {
    const lista = await favoritos.productos(req.session);
    let agregados = 0;
    for (const p of lista) {
      if ((await carrito.agregar(req.session, { id: p.id })).ok) agregados++;
    }
    res.json({
      ok: true,
      agregados,
      sinStock: lista.length - agregados,
      cantidadCarrito: carrito.cantidadTotal(req.session),
    });
  },
};
