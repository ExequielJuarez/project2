const inicioService = require("../services/inicioService");
const productoService = require("../services/productoService");
const pedidoService = require("../services/pedidoService");

// Datos del menú lateral del panel
async function base(req, extra) {
  const [totalProductos, pedidosPendientes] = await Promise.all([productoService.total(), pedidoService.pendientes()]);
  return { usuario: req.session.usuarioLogueado, totalProductos, pedidosPendientes, ...extra };
}

async function render(req, res, { contenido, errores = {}, status = 200 }) {
  res.status(status).render(
    "admin/inicio",
    await base(req, {
      titulo: "Página de inicio",
      estilo: ["admin", "admin-inicio"],
      seccion: "inicio",
      contenido,
      original: inicioService.limpiar({}).contenido,
      secciones: inicioService.SECCIONES,
      errores,
      ultimaEdicion: await inicioService.ultimaEdicion().catch(() => null),
      prefijoPrevia: inicioService.PREFIJO_PREVIA,
    })
  );
}

module.exports = {
  async ver(req, res) {
    await render(req, res, { contenido: await inicioService.obtener() });
  },

  async guardar(req, res) {
    const { contenido, errores } = inicioService.limpiar(req.body, { archivos: req.fotos, estricto: true });
    if (req.errorImagen) errores.fotos = req.errorImagen;

    if (Object.keys(errores).length) {
      // No se guarda nada: las fotos recién subidas se descartan
      await inicioService.descartarSubidas(Object.values(req.fotos));
      if (Object.keys(req.fotos).length) errores.fotosDescartadas = "Las fotos nuevas no se guardaron: volvé a elegirlas.";
      const { contenido: sinFotosNuevas } = inicioService.limpiar(req.body);
      return render(req, res, { contenido: sinFotosNuevas, errores, status: 422 });
    }

    await inicioService.guardar(contenido, req.session.usuarioLogueado.id);
    req.session.flash = "Listo, el inicio quedó actualizado.";
    res.redirect("/admin/inicio");
  },

  // Arma el inicio con lo que hay en el formulario, sin guardar
  async vistaPrevia(req, res) {
    const { contenido } = inicioService.limpiar(req.body, { previa: true });
    res.render("inicio", {
      novedades: await productoService.novedades(4),
      titulo: "Vista previa",
      estilo: "inicio",
      navActivo: "inicio",
      contenido,
      // Se ve como la ve un cliente (sin campanita ni menú de admin)
      usuarioLocal: null,
      flash: null,
    });
  },

  async restablecer(req, res) {
    await inicioService.restablecer();
    req.session.flash = "El inicio volvió a su contenido original.";
    res.redirect("/admin/inicio");
  },
};
