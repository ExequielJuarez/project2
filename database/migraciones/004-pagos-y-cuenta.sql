-- ==========================================================
-- MIGRACIÓN 004 — Pagos con Mercado Pago y datos del cliente
--
-- Para bases creadas ANTES de este cambio. Agrega columnas
-- (no toca ni borra datos):
--   · pedidos:  estado del cobro, id y detalle del pago
--   · usuarios: DNI y dirección guardada para el checkout
-- (La app también las agrega sola al arrancar si faltan.)
--
-- Uso: abrir en Workbench y ejecutar (⚡), o
--      mysql -u root -p tienda_db < database/migraciones/004-pagos-y-cuenta.sql
-- Ejecutala una sola vez. Si instalás la base desde cero con
-- schema.sql, NO hace falta.
-- ==========================================================

USE tienda_db;
SET NAMES utf8mb4;

ALTER TABLE pedidos
  ADD COLUMN pago_estado  ENUM('pendiente', 'aprobado', 'rechazado', 'reembolsado') NOT NULL DEFAULT 'pendiente' AFTER estado,
  ADD COLUMN pago_id      VARCHAR(40)  NULL COMMENT 'id del pago en Mercado Pago' AFTER pago_estado,
  ADD COLUMN pago_detalle VARCHAR(120) NULL COMMENT 'ej: Visa terminada en 4242 · 3 cuotas' AFTER pago_id,
  ADD COLUMN pagado_en    DATETIME     NULL AFTER pago_detalle,
  ADD KEY idx_pedidos_pago (pago_id);

-- Los pedidos que ya estaban pagados quedan con el cobro aprobado
UPDATE pedidos SET pago_estado = 'aprobado', pagado_en = creado_en
WHERE estado IN ('pagado', 'enviado', 'entregado');

ALTER TABLE usuarios
  ADD COLUMN dni           VARCHAR(8)  NULL AFTER newsletter,
  ADD COLUMN calle         VARCHAR(90) NULL AFTER dni,
  ADD COLUMN altura        VARCHAR(10) NULL AFTER calle,
  ADD COLUMN piso          VARCHAR(20) NULL AFTER altura,
  ADD COLUMN codigo_postal CHAR(4)     NULL AFTER piso,
  ADD COLUMN ciudad        VARCHAR(80) NULL AFTER codigo_postal,
  ADD COLUMN provincia     VARCHAR(60) NULL AFTER ciudad;
