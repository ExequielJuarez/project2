// Subida de las fotos del inicio (Admin → Inicio) con multer.
// Cada foto viene en un campo "archivo:<ruta>", por ejemplo
// "archivo:portada.imagen" o "archivo:colecciones.items.2.imagen".
// Guarda en public/img/inicio/subidas; solo JPG, PNG o WEBP de hasta 3 MB c/u.
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const TIPOS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAX_FOTOS = 30;

const subir = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../../public/img/inicio/subidas"),
    filename: (req, file, cb) => cb(null, `inicio-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${TIPOS[file.mimetype]}`),
  }),
  limits: { fileSize: 3 * 1024 * 1024, files: MAX_FOTOS, fields: 400, fieldSize: 20 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^archivo:[\w.]+$/.test(file.fieldname)) return cb(null, false);
    if (TIPOS[file.mimetype]) return cb(null, true);
    const error = new Error("tipo");
    error.code = "TIPO_INVALIDO";
    cb(error);
  },
}).any();

const MENSAJES = {
  LIMIT_FILE_SIZE: "Cada foto puede pesar hasta 3 MB",
  LIMIT_FILE_COUNT: `Podés subir hasta ${MAX_FOTOS} fotos a la vez`,
  TIPO_INVALIDO: "Las fotos tienen que ser JPG, PNG o WEBP",
};

// Envuelve multer: un error de archivo se muestra como error del formulario
// y queda req.fotos = { "portada.imagen": "/img/inicio/subidas/..." }
module.exports = (req, res, next) => {
  subir(req, res, (err) => {
    if (err) req.errorImagen = MENSAJES[err.code] || "No se pudieron subir las fotos";
    req.fotos = {};
    (req.files || []).forEach((f) => (req.fotos[f.fieldname.slice("archivo:".length)] = `/img/inicio/subidas/${f.filename}`));
    next();
  });
};
