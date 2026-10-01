const express = require("express");
const router = express.Router();

const soloAdmin = require("../middlewares/soloAdmin");
const soloSuperAdmin = require("../middlewares/soloSuperAdmin");
const subirImagenes = require("../middlewares/subirImagenes");
const productoValidator = require("../validations/productoValidator");
const admin = require("../controllers/adminController");
const notificaciones = require("../controllers/notificacionesController");
const subirImagenesInicio = require("../middlewares/subirImagenesInicio");
const inicio = require("../controllers/inicioAdminController");
const multer = require("multer");

// La vista previa recibe solo textos (las fotos nuevas se muestran desde el navegador)
const soloCampos = (req, res, next) =>
  multer({ limits: { fields: 400, fieldSize: 20 * 1024 } }).none()(req, res, (err) =>
    err ? res.status(400).send("No se pudo armar la vista previa") : next()
  );

// Todo el panel requiere un administrador (admin o superadmin)
router.use(soloAdmin);

router.get("/", admin.dashboard);

// ── Productos ──────────────────────────────────────────────
router.get("/productos", admin.productos);
router.get("/productos/nuevo", admin.nuevo);
router.post("/productos", subirImagenes, productoValidator, admin.crear);
router.get("/productos/:id", admin.verProducto);
router.get("/productos/:id/editar", admin.editar);
router.put("/productos/:id", subirImagenes, productoValidator, admin.actualizar);
router.delete("/productos/:id", admin.eliminar);
router.patch("/productos/:id/stock", admin.ajustarStock);

// ── Pedidos ────────────────────────────────────────────────
router.get("/pedidos", admin.pedidos);
router.patch("/pedidos/:numero/estado", admin.cambiarEstado);

// ── Página de inicio (solo superadmin: textos, fotos y secciones visibles) ──
router.get("/inicio", soloSuperAdmin, inicio.ver);
router.put("/inicio", soloSuperAdmin, subirImagenesInicio, inicio.guardar);
router.post("/inicio/vista-previa", soloSuperAdmin, soloCampos, inicio.vistaPrevia);
router.delete("/inicio", soloSuperAdmin, inicio.restablecer);

// ── Notificaciones (las usa el panel y la tienda cuando entra un admin) ──
router.get("/notificaciones", notificaciones.listar);
router.post("/notificaciones/leidas", notificaciones.marcarLeidas);
router.get("/notificaciones/stream", notificaciones.stream);

module.exports = router;
