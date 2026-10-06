// Crea las tablas y carga el catálogo de prueba.
// Usa los datos de conexión del .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME...).
//
//   npm run db:instalar            → estructura + datos de prueba
//   npm run db:instalar -- --vacia → solo la estructura, sin datos
//
// ATENCIÓN: borra y vuelve a crear todas las tablas de DB_NAME.
//
// Además, la app lo ejecuta sola al arrancar (npm start) cuando la base
// todavía no tiene la tabla "productos" (ver src/app.js). Así, con una base
// nueva (por ejemplo en Clever Cloud o Render) alcanza con `npm start`.

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function instalar({ soloEstructura = false, log = console.log } = {}) {
  const DB = process.env.DB_NAME || "tienda_db";
  // Los .sql usan "tienda_db"; si el .env pide otro nombre, se reemplaza
  // y la zona horaria sigue a DB_TIMEZONE
  const ZONA = process.env.DB_TIMEZONE || "-03:00";
  const leer = (archivo) =>
    fs
      .readFileSync(path.join(__dirname, archivo), "utf8")
      .replace(/\btienda_db\b/g, `\`${DB}\``)
      .replace(/SET time_zone = '[^']*'/g, `SET time_zone = '${ZONA}'`);

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || undefined,
    database: undefined,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    // En un hosting (Clever Cloud, etc.) la base ya existe y el usuario no puede
    // crearla: se intenta y, si no hay permiso, se sigue con la que ya está.
    await conexion.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`).catch(() => {});
    await conexion.query(`USE \`${DB}\``);

    log(`→ Creando estructura en "${DB}"…`);
    // El CREATE DATABASE / USE del schema ya se resolvió arriba
    const schema = leer("schema.sql").replace(/CREATE DATABASE[^;]*;/i, "");
    await conexion.query(schema);

    if (!soloEstructura) {
      log("→ Cargando catálogo y datos de prueba…");
      await conexion.query(leer("datos-prueba.sql"));
    }

    const [tablas] = await conexion.query(
      `SELECT table_name AS tabla, table_rows AS filas FROM information_schema.tables
       WHERE table_schema = ? ORDER BY table_name`,
      [DB]
    );
    return tablas;
  } finally {
    await conexion.end();
  }
}

// ¿Hace falta instalar? Sí si la base no tiene todavía la tabla de productos.
async function hayQueInstalar(sequelize) {
  const tablas = await sequelize.getQueryInterface().showAllTables();
  return !tablas.map((t) => String(t.tableName || t).toLowerCase()).includes("productos");
}

module.exports = { instalar, hayQueInstalar };

if (require.main === module) {
  instalar({ soloEstructura: process.argv.includes("--vacia") })
    .then((tablas) => {
      console.table(tablas);
      console.log("✅ Base de datos lista.");
    })
    .catch((error) => {
      console.error("❌ No se pudo instalar la base de datos:", error.message);
      process.exitCode = 1;
    });
}
