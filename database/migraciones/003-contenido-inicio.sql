-- ==========================================================
-- MIGRACIÓN 003 — Contenido editable del inicio
--
-- Para bases creadas ANTES de este cambio. Crea la tabla
-- contenido_inicio. No toca ni borra datos.
-- (La app también la crea sola al arrancar si no existe.)
--
-- Uso: abrir en Workbench y ejecutar (⚡), o
--      mysql -u root -p tienda_db < database/migraciones/003-contenido-inicio.sql
-- Si instalás la base desde cero con schema.sql, NO hace falta.
-- ==========================================================

USE tienda_db;
SET NAMES utf8mb4;

-- ----------------------------------------------------------
-- contenido_inicio: textos e imágenes de la página de inicio que
-- se editan desde el panel (Admin → Inicio). Una sola fila (id 1).
-- datos guarda el contenido en JSON; lo que falte se completa con
-- el original de src/data/inicioEditable.js
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS contenido_inicio (
  id             TINYINT UNSIGNED NOT NULL DEFAULT 1,
  datos          LONGTEXT     NOT NULL COMMENT 'JSON con el contenido editado',
  usuario_id     INT UNSIGNED NULL COMMENT 'último admin que lo modificó',
  actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_contenido_inicio_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
