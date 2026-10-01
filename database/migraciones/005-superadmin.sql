-- ==========================================================
-- MIGRACIÓN 005 — Rol superadmin
--
-- Para bases creadas ANTES de este cambio. Agrega el rol
-- "superadmin": tiene todo lo del admin y además el editor de la
-- página de inicio. No toca ni borra datos.
-- (La app también lo agrega sola al arrancar.)
--
-- Uso: abrir en Workbench y ejecutar (⚡).
-- ==========================================================

USE tienda_db;

ALTER TABLE usuarios
  MODIFY rol ENUM('cliente', 'admin', 'superadmin') NOT NULL DEFAULT 'cliente';

-- Para darle el rol a tu cuenta, cambiá el email y ejecutá:
-- UPDATE usuarios SET rol = 'superadmin' WHERE email = 'tu-email@ejemplo.com';
