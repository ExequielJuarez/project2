// Crea la base de datos y carga la estructura + los datos de prueba.
// Usa los datos de conexión del .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME...).
//
//   npm run db:instalar            → estructura + datos de prueba
//   npm run db:instalar -- --vacia → solo la estructura, sin datos
//
// ATENCIÓN: borra y vuelve a crear todas las tablas de DB_NAME.

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const DB = process.env.DB_NAME || "tienda_db";
const soloEstructura = process.argv.includes("--vacia");

// Los .sql usan "tienda_db"; si el .env pide otro nombre, se reemplaza
// y la zona horaria sigue a DB_TIMEZONE
const ZONA = process.env.DB_TIMEZONE || "-03:00";
const leer = (archivo) =>
  fs
    .readFileSync(path.join(__dirname, archivo), "utf8")
    .replace(/\btienda_db\b/g, `\`${DB}\``)
    .replace(/SET time_zone = '[^']*'/g, `SET time_zone = '${ZONA}'`);

(async () => {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || undefined,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    console.log(`→ Creando estructura en "${DB}"…`);
    await conexion.query(leer("schema.sql"));

    if (!soloEstructura) {
      console.log("→ Cargando datos de prueba…");
      await conexion.query(leer("datos-prueba.sql"));
    }

    const [tablas] = await conexion.query(
      `SELECT table_name AS tabla, table_rows AS filas FROM information_schema.tables
       WHERE table_schema = ? ORDER BY table_name`,
      [DB]
    );
    console.table(tablas);
    console.log("✅ Base de datos lista.");
  } catch (error) {
    console.error("❌ No se pudo instalar la base de datos:", error.message);
    process.exitCode = 1;
  } finally {
    await conexion.end();
  }
})();
