// Si el usuario ya inició sesión, no tiene sentido mostrarle el login
module.exports = (req, res, next) => {
  if (req.session.usuarioLogueado) return res.redirect("/");
  next();
};
