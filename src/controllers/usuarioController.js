const crypto = require("crypto");
const { validationResult } = require("express-validator");
const usuarios = require("../services/usuarioService");
const favoritoService = require("../services/favoritoService");

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 60 * 1000;
const RECORDAR_MS = 30 * 24 * 60 * 60 * 1000;

// Google: si están estas variables en .env se usa el inicio de sesión real,
// si no, un modo demo para mostrar la maqueta
const GOOGLE = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callback: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
};
const googleConfigurado = () => Boolean(GOOGLE.clientId && GOOGLE.clientSecret);
// Con la tienda publicada (NODE_ENV=production) no hay modo demo de Google
// ni se muestran los usuarios de prueba en el login
const enProduccion = () => process.env.NODE_ENV === "production";

// Solo permitimos volver a rutas internas (evita redirecciones a otros sitios)
function destinoSeguro(url) {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : "/";
}

// Crea una sesión nueva (evita fijación de sesión) conservando carrito y checkout;
// los favoritos de invitado pasan a la cuenta
function iniciarSesion(req, res, usuario, { recordar = false, volver = "/", mensaje } = {}) {
  const { carrito, checkout, favoritos } = req.session;
  req.session.regenerate(async (err) => {
    if (err) {
      req.session.flash = "No pudimos iniciar sesión, probá de nuevo.";
      return res.redirect("/login");
    }
    Object.assign(req.session, { carrito, checkout, favoritos, usuarioLogueado: usuario });
    try {
      await favoritoService.pasarACuenta(req.session, usuario.id);
    } catch (error) {
      console.error("No se pudieron pasar los favoritos a la cuenta:", error.message);
    }
    if (recordar) req.session.cookie.maxAge = RECORDAR_MS;
    req.session.flash = mensaje || `¡Hola, ${usuario.nombre}! Iniciaste sesión.`;
    req.session.save(() => res.redirect(destinoSeguro(volver)));
  });
}

function renderLogin(res, { req, datos = {}, errores = {}, errorGeneral = null, status = 200 }) {
  res.status(status).render("login", {
    titulo: "Iniciar sesión",
    estilo: ["acceso", "login"],
    datos,
    errores,
    errorGeneral,
    mostrarDemo: !enProduccion(),
    volver: destinoSeguro(req.query.volver || req.body?.volver),
  });
}

function renderRegistro(res, { req, datos = {}, errores = {}, status = 200 }) {
  res.status(status).render("registro", {
    titulo: "Crear cuenta",
    estilo: ["acceso", "registro"],
    datos,
    errores,
    volver: destinoSeguro(req.query.volver || req.body?.volver),
  });
}

module.exports = {
  // ── Login con email ────────────────────────────────────────
  verLogin(req, res) {
    renderLogin(res, { req });
  },

  async login(req, res) {
    const datos = { email: req.body.email || "", recordar: Boolean(req.body.recordar) };

    // Freno simple contra intentos repetidos
    const intentos = req.session.intentosLogin || { cantidad: 0, hasta: 0 };
    if (intentos.hasta > Date.now()) {
      const segundos = Math.ceil((intentos.hasta - Date.now()) / 1000);
      return renderLogin(res, {
        req, datos, status: 429,
        errorGeneral: `Demasiados intentos. Probá de nuevo en ${segundos} segundos.`,
      });
    }

    const resultado = validationResult(req);
    if (!resultado.isEmpty()) {
      return renderLogin(res, { req, datos, errores: resultado.mapped(), status: 422 });
    }

    const usuario = await usuarios.verificar(req.body.email, req.body.password);

    if (!usuario) {
      intentos.cantidad += 1;
      if (intentos.cantidad >= MAX_INTENTOS) {
        intentos.cantidad = 0;
        intentos.hasta = Date.now() + BLOQUEO_MS;
      }
      req.session.intentosLogin = intentos;
      return renderLogin(res, {
        req, datos, status: 401,
        errorGeneral: "El email o la contraseña no son correctos.",
      });
    }

    iniciarSesion(req, res, usuario, { recordar: datos.recordar, volver: req.body.volver });
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  },

  // ── Registro ───────────────────────────────────────────────
  verRegistro(req, res) {
    renderRegistro(res, { req });
  },

  async registrar(req, res) {
    const { nombre, apellido, email, telefono } = req.body;
    const datos = { nombre, apellido, email, telefono, newsletter: Boolean(req.body.newsletter), terminos: req.body.terminos === "1" };

    const resultado = validationResult(req);
    if (!resultado.isEmpty()) {
      return renderRegistro(res, { req, datos, errores: resultado.mapped(), status: 422 });
    }

    const usuario = await usuarios.crear({
      nombre,
      apellido,
      email,
      telefono,
      password: req.body.password,
      newsletter: datos.newsletter,
    });
    iniciarSesion(req, res, usuario, {
      volver: req.body.volver,
      mensaje: `¡Bienvenido/a, ${usuario.nombre}! Tu cuenta está lista.`,
    });
  },

  // ── Google ─────────────────────────────────────────────────
  googleInicio(req, res) {
    const volver = destinoSeguro(req.query.volver);
    if (!googleConfigurado()) {
      if (enProduccion()) {
        req.session.flash = "El inicio de sesión con Google todavía no está disponible. Entrá con tu email.";
        return res.redirect("/login");
      }
      return res.redirect(`/auth/google/demo?volver=${encodeURIComponent(volver)}`);
    }

    // "state" aleatorio para verificar que la respuesta de Google es de este pedido
    const state = crypto.randomBytes(16).toString("hex");
    req.session.google = { state, volver };

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: GOOGLE.clientId,
      redirect_uri: GOOGLE.callback,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    req.session.save(() => res.redirect(url.toString()));
  },

  async googleCallback(req, res) {
    const esperado = req.session.google;
    delete req.session.google;

    if (!esperado || req.query.state !== esperado.state || !req.query.code) {
      req.session.flash = "No pudimos iniciar sesión con Google. Probá de nuevo.";
      return res.redirect("/login");
    }

    try {
      // Cambiamos el código por un token de acceso
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: req.query.code,
          client_id: GOOGLE.clientId,
          client_secret: GOOGLE.clientSecret,
          redirect_uri: GOOGLE.callback,
          grant_type: "authorization_code",
        }),
      });
      const token = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(token.error_description || "Token inválido");

      // Y con el token pedimos los datos del perfil
      const perfilRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      const perfil = await perfilRes.json();
      if (!perfilRes.ok || !perfil.email_verified) throw new Error("Email de Google no verificado");

      const usuario = await usuarios.desdeGoogle({
        googleId: perfil.sub,
        email: perfil.email,
        nombre: perfil.given_name || perfil.name || "Cliente",
        apellido: perfil.family_name || "",
      });
      iniciarSesion(req, res, usuario, { volver: esperado.volver });
    } catch (error) {
      console.error("Error en el login con Google:", error.message);
      req.session.flash = "No pudimos iniciar sesión con Google. Probá de nuevo.";
      res.redirect("/login");
    }
  },

  // Modo demo: simula la elección de cuenta cuando Google no está configurado
  googleDemo(req, res) {
    if (googleConfigurado() || enProduccion()) return res.redirect("/auth/google");
    res.render("google-demo", {
      titulo: "Continuar con Google",
      estilo: "google-demo",
      volver: destinoSeguro(req.query.volver),
      errores: {},
      datos: {},
    });
  },

  async googleDemoConfirmar(req, res) {
    if (googleConfigurado() || enProduccion()) return res.redirect("/auth/google");

    const email = String(req.body.email || "").trim().toLowerCase();
    const nombre = String(req.body.nombre || "").trim();
    const error = (msg) =>
      res.status(422).render("google-demo", {
        titulo: "Continuar con Google",
        estilo: "google-demo",
        volver: destinoSeguro(req.body.volver),
        datos: { email, nombre },
        errores: { email: { msg } },
      });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || nombre.length < 2) {
      return error("Completá un nombre y un email válidos");
    }

    // La demo no verifica el email: solo puede entrar a cuentas creadas por la
    // propia demo (si no, cualquiera podría entrar a la cuenta de otro, incluso al admin)
    const existente = await usuarios.buscarPorEmail(email);
    if (existente && existente.googleId !== `demo-${email}`) {
      return error("Ya existe una cuenta con ese email: entrá con tu contraseña");
    }

    const [primerNombre, ...resto] = nombre.split(" ");
    const usuario = await usuarios.desdeGoogle({
      googleId: `demo-${email}`,
      email,
      nombre: primerNombre,
      apellido: resto.join(" "),
    });
    iniciarSesion(req, res, usuario, { volver: req.body.volver });
  },
};
