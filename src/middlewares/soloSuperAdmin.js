// Solo para el superadmin (por ejemplo, el editor de la página de inicio).
// Va después de soloAdmin: un admin común vuelve al panel con un aviso.
const { esSuperAdmin } = require("../helpers/roles");

module.exports = (req, res, next) => {
  if (esSuperAdmin(req.session.usuarioLogueado)) return next();
  if (req.method !== "GET" || req.accepts(["html", "json"]) === "json") {
    return res.status(403).json({ ok: false, mensaje: "Solo el superadministrador puede hacer esto" });
  }
  req.session.flash = "Esa sección es solo para el superadministrador.";
  res.redirect("/admin");
};
