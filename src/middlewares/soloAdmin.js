// Solo deja pasar a administradores (admin o superadmin).
// Si no inició sesión lo manda al login (y después vuelve acá).
const { esAdmin } = require("../helpers/roles");

module.exports = (req, res, next) => {
  const usuario = req.session.usuarioLogueado;
  if (!usuario) return res.redirect(`/login?volver=${encodeURIComponent(req.originalUrl)}`);
  if (!esAdmin(usuario)) {
    req.session.flash = "No tenés permiso para entrar al panel de administración.";
    return res.redirect("/");
  }
  next();
};
