-- ==========================================================
-- MIGRACIÓN 002 — Notificaciones para el admin
--
-- Para bases creadas ANTES de este cambio. Crea la tabla
-- notificaciones. No toca ni borra datos.
--
-- Uso: abrir en Workbench y ejecutar (⚡), o
--      mysql -u root -p tienda_db < database/migraciones/002-notificaciones.sql
-- Si instalás la base desde cero con schema.sql, NO hace falta.
-- ==========================================================

USE tienda_db;
SET NAMES utf8mb4;

-- ----------------------------------------------------------
-- notificaciones: avisos para los administradores
-- (compra nueva, producto con poco stock). leida es compartida
-- entre todos los admins de la tienda.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  tipo        ENUM('pedido', 'stock') NOT NULL DEFAULT 'pedido',
  titulo      VARCHAR(120)  NOT NULL,
  mensaje     VARCHAR(255)  NULL,
  url         VARCHAR(255)  NULL COMMENT 'a dónde lleva el aviso, ej: /admin/pedidos?q=1081',
  pedido_id   INT UNSIGNED  NULL,
  producto_id INT UNSIGNED  NULL,
  leida       TINYINT(1)    NOT NULL DEFAULT 0,
  creado_en   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notificaciones_leida (leida, creado_en),
  CONSTRAINT fk_notificaciones_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_notificaciones_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
