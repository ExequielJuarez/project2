-- ==========================================================
-- MIGRACIÓN 001 — Varias imágenes por producto
--
-- Para bases creadas ANTES de este cambio (con productos.imagen).
-- Crea la tabla producto_imagenes, copia la imagen que tenía cada
-- producto y borra la columna vieja. No pierde datos.
--
-- Uso: abrir en Workbench y ejecutar (⚡), o
--      mysql -u root -p tienda_db < database/migraciones/001-varias-imagenes.sql
-- Si instalás la base desde cero con schema.sql, NO hace falta.
-- ==========================================================

USE tienda_db;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS producto_imagenes (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  producto_id  INT UNSIGNED      NOT NULL,
  ruta         VARCHAR(255)      NOT NULL COMMENT 'ruta pública, ej: /img/productos/x.jpg',
  orden        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_imagenes_producto (producto_id, orden),
  CONSTRAINT fk_imagenes_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO producto_imagenes (producto_id, ruta, orden)
SELECT id, imagen, 0 FROM productos WHERE imagen IS NOT NULL AND imagen <> '';

ALTER TABLE productos DROP COLUMN imagen;
