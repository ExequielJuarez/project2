// Solo para usuarios que iniciaron sesión (Mi cuenta).
// Si no inició sesión lo manda al login y después vuelve acá.
module.exports = (req, res, next) => {
  if (!req.session.usuarioLogueado) return res.redirect(`/login?volver=${encodeURIComponent(req.originalUrl)}`);
  next();
};
