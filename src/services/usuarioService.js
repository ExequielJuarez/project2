// Usuarios (tabla usuarios). Las contraseñas se guardan hasheadas con bcrypt.

const bcrypt = require("bcryptjs");
const db = require("../model/database/models");

// Hash de relleno para comparar cuando el email no existe
const HASH_FALSO = bcrypt.hashSync("no-es-una-clave-real", 10);

// Lo que se guarda en la sesión: nunca la contraseña
function publico(usuario) {
  if (!usuario) return null;
  const { id, nombre, apellido, email, telefono, rol, googleId } = usuario.get ? usuario.get({ plain: true }) : usuario;
  return { id, nombre, apellido, email, telefono: telefono || "", rol, googleId };
}

async function buscarPorId(id) {
  return publico(await db.Usuario.findByPk(id));
}

async function buscarPorEmail(email) {
  return publico(await db.Usuario.findOne({ where: { email: String(email).trim().toLowerCase() } }));
}

// Devuelve el usuario si las credenciales son correctas
async function verificar(email, password) {
  const usuario = await db.Usuario.scope("conPassword").findOne({
    where: { email: String(email).trim().toLowerCase() },
  });
  // Si el email no existe (o la cuenta es solo de Google) igual comparamos
  // contra un hash, para no delatar por el tiempo de respuesta qué emails existen
  const ok = await bcrypt.compare(String(password), usuario?.password || HASH_FALSO);
  if (!usuario || !usuario.password || !ok) return null;
  return publico(usuario);
}

async function crear({ nombre, apellido, email, telefono = null, password = null, googleId = null, newsletter = false }) {
  const usuario = await db.Usuario.create({
    nombre,
    apellido: apellido || "",
    email,
    telefono: telefono || null,
    password: password ? await bcrypt.hash(password, 10) : null,
    googleId,
    newsletter,
  });
  return publico(usuario);
}

// Busca la cuenta vinculada a Google; si no existe, la vincula por email o la crea
async function desdeGoogle({ googleId, email, nombre, apellido }) {
  let usuario = await db.Usuario.findOne({ where: { googleId } });
  if (!usuario) usuario = await db.Usuario.findOne({ where: { email: String(email).toLowerCase() } });
  if (usuario) {
    if (!usuario.googleId) await usuario.update({ googleId });
    return publico(usuario);
  }
  return crear({ nombre, apellido, email, googleId });
}

// ── Mi cuenta ───────────────────────────────────────────────
// Datos completos para la vista "Mis datos" y para completar el checkout
async function perfil(id) {
  const usuario = await db.Usuario.scope("conPassword").findByPk(id);
  if (!usuario) return null;
  const x = usuario.get({ plain: true });
  return {
    ...publico(usuario),
    dni: x.dni || "",
    calle: x.calle || "",
    numero: x.altura || "",
    piso: x.piso || "",
    codigoPostal: x.codigoPostal || "",
    ciudad: x.ciudad || "",
    provincia: x.provincia || "",
    tieneClave: Boolean(x.password),
    tieneDireccion: Boolean(x.calle && x.codigoPostal),
  };
}

async function actualizarPerfil(id, datos) {
  const usuario = await db.Usuario.findByPk(id);
  const vacio = (v) => (v === undefined ? undefined : String(v).trim() || null);
  await usuario.update({
    nombre: String(datos.nombre).trim(),
    apellido: String(datos.apellido).trim(),
    email: datos.email,
    telefono: vacio(datos.telefono),
    dni: vacio(datos.dni),
    calle: vacio(datos.calle),
    altura: vacio(datos.numero),
    piso: vacio(datos.piso),
    codigoPostal: vacio(datos.codigoPostal),
    ciudad: vacio(datos.ciudad),
    provincia: vacio(datos.provincia),
  });
  return publico(usuario);
}

// Guarda DNI y dirección del checkout si la cuenta todavía no tenía
async function guardarDireccionSiFalta(id, datos) {
  const usuario = await db.Usuario.findByPk(id);
  if (!usuario) return;
  const cambios = {};
  if (!usuario.dni && datos.dni) cambios.dni = datos.dni;
  if (!usuario.telefono && datos.telefono) cambios.telefono = datos.telefono;
  if (!usuario.calle && datos.entrega === "domicilio" && datos.calle) {
    Object.assign(cambios, {
      calle: datos.calle,
      altura: datos.numero,
      piso: datos.piso || null,
      codigoPostal: datos.codigoPostal,
      ciudad: datos.ciudad,
      provincia: datos.provincia,
    });
  }
  if (Object.keys(cambios).length) await usuario.update(cambios);
}

// Cambia (o crea, en cuentas de Google) la contraseña. Devuelve false si la actual no coincide.
async function cambiarClave(id, actual, nueva) {
  const usuario = await db.Usuario.scope("conPassword").findByPk(id);
  if (!usuario) return false;
  if (usuario.password && !(await bcrypt.compare(String(actual || ""), usuario.password))) return false;
  await usuario.update({ password: await bcrypt.hash(nueva, 10) });
  return true;
}

module.exports = {
  publico,
  buscarPorId,
  buscarPorEmail,
  verificar,
  crear,
  desdeGoogle,
  perfil,
  actualizarPerfil,
  guardarDireccionSiFalta,
  cambiarClave,
};
