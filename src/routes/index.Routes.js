const express = require("express");
const router = express.Router();

const productoService = require("../services/productoService");
const inicioService = require("../services/inicioService");
const carritoController = require("../controllers/carritoController");
const checkoutController = require("../controllers/checkoutController");
const checkoutValidator = require("../validations/checkoutValidator");
const usuarioController = require("../controllers/usuarioController");
const loginValidator = require("../validations/loginValidator");
const registroValidator = require("../validations/registroValidator");
const soloInvitados = require("../middlewares/soloInvitados");
const favoritosController = require("../controllers/favoritosController");
const pagosController = require("../controllers/pagosController");
const cuentaController = require("../controllers/cuentaController");
const soloLogueados = require("../middlewares/soloLogueados");
const perfilValidator = require("../validations/perfilValidator");
const claveValidator = require("../validations/claveValidator");

// ── INICIO (presentación de la marca, sin precios) ─────────
// Los textos y fotos se editan desde Admin → Inicio
router.get("/", async (req, res) => {
  const [contenido, novedades] = await Promise.all([inicioService.obtener(), productoService.novedades(4)]);
  res.render("inicio", { titulo: "Moda y tendencias", estilo: "inicio", navActivo: "inicio", contenido, novedades });
});

// XS → XXL primero, después los talles numéricos (36, 38…) y lo demás
const ORDEN_TALLES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const ordenarTalles = (lista) =>
  lista.sort((a, b) => {
    const [ia, ib] = [ORDEN_TALLES.indexOf(a), ORDEN_TALLES.indexOf(b)];
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    return a.localeCompare(b, "es", { numeric: true });
  });

// ── CATÁLOGO DE PRODUCTOS (y resultados de búsqueda con ?q=) ─
router.get("/catalogo", async (req, res) => {
  const busqueda = String(req.query.q || "").trim().slice(0, 60);
  const [productos, colores, categorias] = await Promise.all([
    productoService.listar({ q: busqueda }),
    productoService.colores(),
    productoService.categorias(),
  ]);

  res.render("catalogo", {
    titulo: busqueda ? `Resultados para “${busqueda}”` : "Catálogo",
    estilo: "catalogo",
    navActivo: "catalogo",
    busqueda,
    productos,
    talles: ordenarTalles([...new Set(productos.flatMap((p) => p.talles))]),
    colores: colores.map((c) => ({ ...c, cantidad: productos.filter((p) => p.color === c.valor).length })),
    categorias: categorias.map((nombre) => ({ nombre, cantidad: productos.filter((p) => p.categoria === nombre).length })),
  });
});

// Sugerencias mientras se escribe en el buscador (JSON)
router.get("/buscar/sugerencias", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 60);
  if (q.length < 2) return res.json({ ok: true, total: 0, productos: [] });

  const encontrados = await productoService.listar({ q });
  res.json({
    ok: true,
    total: encontrados.length,
    productos: encontrados.slice(0, 6).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      imagen: p.imagen,
      sinStock: p.stock <= 0,
    })),
  });
});

// ── DETALLE DE PRODUCTO ────────────────────────────────────
router.get("/producto/:id", async (req, res) => {
  const producto = await productoService.obtener(req.params.id);
  if (!producto) return res.redirect("/catalogo");

  const [colores, relacionados] = await Promise.all([
    productoService.colores(),
    productoService.relacionados(producto.id),
  ]);
  res.render("producto", {
    titulo: producto.nombre,
    estilo: "producto",
    navActivo: "catalogo",
    producto,
    colores,
    relacionados,
  });
});

// ── CARRITO ────────────────────────────────────────────────
router.get("/carrito", carritoController.ver);
router.post("/carrito/agregar", carritoController.agregar);
router.patch("/carrito/item/:clave", carritoController.actualizar);
router.delete("/carrito/item/:clave", carritoController.quitar);
router.delete("/carrito", carritoController.vaciar);
router.post("/carrito/cupon", carritoController.cupon);
router.delete("/carrito/cupon", carritoController.quitarCupon);
router.post("/carrito/medio-pago", carritoController.medioPago);
router.post("/carrito/envio", carritoController.envio);
router.post("/carrito/entrega", carritoController.entrega);

// ── FAVORITOS ──────────────────────────────────────────────
router.get("/favoritos", favoritosController.ver);
router.post("/favoritos/al-carrito", favoritosController.alCarrito);
router.post("/favoritos/:id", favoritosController.alternar);
router.delete("/favoritos", favoritosController.vaciar);

// ── CHECKOUT ───────────────────────────────────────────────
router.get("/checkout/datos", checkoutController.ver);
router.post("/checkout/datos", checkoutValidator, checkoutController.guardar);
router.get("/checkout/pago", checkoutController.verPago);
router.post("/checkout/confirmar", checkoutController.confirmar);

// ── PAGOS (Mercado Pago) Y DETALLE DE UN PEDIDO ────────────
router.get("/pedido/:numero", pagosController.detalle);
router.post("/pedido/:numero/pagar", pagosController.pagar);
router.post("/pedido/:numero/cancelar", pagosController.cancelar);
router.get("/pagos/retorno", pagosController.retorno);
router.post("/pagos/webhook", pagosController.webhook);
router.get("/pagos/demo/:numero", pagosController.verDemo);
router.post("/pagos/demo/:numero", pagosController.confirmarDemo);

// ── MI CUENTA ──────────────────────────────────────────────
router.get("/mi-cuenta", soloLogueados, (req, res) => res.redirect("/mi-cuenta/pedidos"));
router.get("/mi-cuenta/pedidos", soloLogueados, cuentaController.pedidos);
router.get("/mi-cuenta/datos", soloLogueados, cuentaController.verDatos);
router.post("/mi-cuenta/datos", soloLogueados, perfilValidator, cuentaController.guardarDatos);
router.post("/mi-cuenta/clave", soloLogueados, claveValidator, cuentaController.cambiarClave);

// ── USUARIOS ───────────────────────────────────────────────
router.get("/login", soloInvitados, usuarioController.verLogin);
router.post("/login", soloInvitados, loginValidator, usuarioController.login);
router.post("/logout", usuarioController.logout);
router.get("/registro", soloInvitados, usuarioController.verRegistro);
router.post("/registro", soloInvitados, registroValidator, usuarioController.registrar);

// Google (real si está configurado en .env, demo si no)
router.get("/auth/google", soloInvitados, usuarioController.googleInicio);
router.get("/auth/google/callback", usuarioController.googleCallback);
router.get("/auth/google/demo", soloInvitados, usuarioController.googleDemo);
router.post("/auth/google/demo", soloInvitados, usuarioController.googleDemoConfirmar);

module.exports = router;
