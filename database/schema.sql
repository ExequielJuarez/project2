-- ==========================================================
-- MATILDA BOUTIQUE — Estructura de la base de datos (MySQL 8 / MariaDB 10.5+)
--
-- Crea todas las tablas desde cero. Si ya existen, las borra antes.
-- Los datos de prueba están aparte, en datos-prueba.sql.
--
-- Uso:  npm run db:instalar      (usa los datos de conexión del .env)
--   o:  mysql -u root -p < database/schema.sql
-- ==========================================================

CREATE DATABASE IF NOT EXISTS tienda_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tienda_db;

-- Acentos y ñ bien guardados aunque el cliente de MySQL no esté en UTF-8
SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS contenido_inicio;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS pedido_items;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS especificaciones;
DROP TABLE IF EXISTS producto_imagenes;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS colores;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS cupones;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- usuarios: clientes y administradores
-- password es NULL en cuentas creadas solo con Google
-- ----------------------------------------------------------
CREATE TABLE usuarios (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(40)  NOT NULL,
  apellido        VARCHAR(40)  NOT NULL DEFAULT '',
  email           VARCHAR(120) NOT NULL,
  telefono        VARCHAR(20)  NULL,
  password        CHAR(60)     NULL COMMENT 'hash bcrypt',
  google_id       VARCHAR(64)  NULL,
  rol             ENUM('cliente', 'admin', 'superadmin') NOT NULL DEFAULT 'cliente' COMMENT 'superadmin: además edita la página de inicio',
  newsletter      TINYINT(1)   NOT NULL DEFAULT 0,
  -- Datos guardados para completar el checkout (Mi cuenta → Mis datos)
  dni             VARCHAR(8)   NULL,
  calle           VARCHAR(90)  NULL,
  altura          VARCHAR(10)  NULL,
  piso            VARCHAR(20)  NULL,
  codigo_postal   CHAR(4)      NULL,
  ciudad          VARCHAR(80)  NULL,
  provincia       VARCHAR(60)  NULL,
  creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  UNIQUE KEY uq_usuarios_google (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- categorias y colores: tablas de referencia del catálogo
-- ----------------------------------------------------------
CREATE TABLE categorias (
  id      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre  VARCHAR(60)       NOT NULL,
  orden   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE colores (
  id      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  valor   VARCHAR(30)       NOT NULL COMMENT 'identificador usado en filtros, ej: negro',
  nombre  VARCHAR(40)       NOT NULL,
  hex     CHAR(7)           NOT NULL,
  orden   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_colores_valor (valor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- productos: costo = lo que le cuesta a la tienda cada unidad
-- (se usa para calcular la ganancia)
-- ----------------------------------------------------------
CREATE TABLE productos (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(90)       NOT NULL,
  categoria_id    SMALLINT UNSIGNED NOT NULL,
  color_id        SMALLINT UNSIGNED NOT NULL,
  precio          DECIMAL(12, 2)    NOT NULL,
  costo           DECIMAL(12, 2)    NOT NULL DEFAULT 0,
  stock           INT UNSIGNED      NOT NULL DEFAULT 0,
  etiqueta        VARCHAR(24)       NULL COMMENT 'Nuevo, Más vendido, etc.',
  talles          VARCHAR(80)       NULL COMMENT 'talles separados por coma: S,M,L,XL (NULL = talle único)',
  resumen         VARCHAR(255)      NULL,
  descripcion     TEXT              NULL COMMENT 'párrafos separados por una línea en blanco',
  destacados      TEXT              NULL COMMENT 'un punto destacado por línea',
  creado_en       DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_productos_categoria (categoria_id),
  KEY idx_productos_color (color_id),
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_productos_color FOREIGN KEY (color_id) REFERENCES colores (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_productos_precio CHECK (precio > 0),
  CONSTRAINT ck_productos_costo CHECK (costo >= 0 AND costo <= precio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- producto_imagenes: fotos de cada producto (hasta 8).
-- La de menor "orden" es la principal (la que sale en las tarjetas).
-- ----------------------------------------------------------
CREATE TABLE producto_imagenes (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  producto_id  INT UNSIGNED      NOT NULL,
  ruta         VARCHAR(255)      NOT NULL COMMENT 'ruta pública, ej: /img/productos/x.jpg',
  orden        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_imagenes_producto (producto_id, orden),
  CONSTRAINT fk_imagenes_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- especificaciones: ficha técnica de cada producto (clave / valor)
-- ----------------------------------------------------------
CREATE TABLE especificaciones (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  producto_id  INT UNSIGNED      NOT NULL,
  clave        VARCHAR(60)       NOT NULL,
  valor        VARCHAR(120)      NOT NULL,
  orden        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_especificaciones_producto (producto_id),
  CONSTRAINT fk_especificaciones_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- favoritos: productos guardados por cada usuario
-- (los invitados los guardan en la sesión y pasan acá al iniciar sesión)
-- ----------------------------------------------------------
CREATE TABLE favoritos (
  usuario_id   INT UNSIGNED NOT NULL,
  producto_id  INT UNSIGNED NOT NULL,
  creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, producto_id),
  KEY idx_favoritos_producto (producto_id),
  CONSTRAINT fk_favoritos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_favoritos_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- cupones de descuento (porcentaje: 0.10 = 10%)
-- ----------------------------------------------------------
CREATE TABLE cupones (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  codigo          VARCHAR(30)   NOT NULL,
  descripcion     VARCHAR(120)  NOT NULL,
  porcentaje      DECIMAL(5, 4) NOT NULL,
  activo          TINYINT(1)    NOT NULL DEFAULT 1,
  vence_en        DATETIME      NULL,
  creado_en       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cupones_codigo (codigo),
  CONSTRAINT ck_cupones_porcentaje CHECK (porcentaje > 0 AND porcentaje < 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- pedidos: el id es el número de pedido (arranca en 1001)
-- Los importes se guardan al momento de la compra, así la
-- ganancia histórica no cambia si después se edita un producto.
-- ganancia = subtotal - descuento - costo (no incluye el envío)
-- ----------------------------------------------------------
CREATE TABLE pedidos (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED   NULL COMMENT 'NULL si compró como invitado',
  cliente         VARCHAR(90)    NOT NULL,
  email           VARCHAR(120)   NULL,
  telefono        VARCHAR(20)    NULL,
  dni             VARCHAR(8)     NULL,
  entrega         ENUM('domicilio', 'retiro') NOT NULL DEFAULT 'domicilio',
  calle           VARCHAR(90)    NULL,
  altura          VARCHAR(10)    NULL,
  piso            VARCHAR(20)    NULL,
  codigo_postal   CHAR(4)        NULL,
  ciudad          VARCHAR(80)    NULL,
  provincia       VARCHAR(60)    NULL,
  notas           VARCHAR(300)   NULL,
  facturacion     ENUM('consumidor', 'facturaA') NOT NULL DEFAULT 'consumidor',
  cuit            VARCHAR(13)    NULL,
  razon_social    VARCHAR(120)   NULL,
  medio_pago      ENUM('tarjeta', 'transferencia') NOT NULL DEFAULT 'tarjeta',
  cupon_codigo    VARCHAR(30)    NULL,
  estado          ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  -- Cobro (Mercado Pago para tarjetas; transferencia la confirma el admin)
  pago_estado     ENUM('pendiente', 'aprobado', 'rechazado', 'reembolsado') NOT NULL DEFAULT 'pendiente',
  pago_id         VARCHAR(40)    NULL COMMENT 'id del pago en Mercado Pago',
  pago_detalle    VARCHAR(120)   NULL COMMENT 'ej: Visa terminada en 4242 · 3 cuotas',
  pagado_en       DATETIME       NULL,
  subtotal        DECIMAL(12, 2) NOT NULL DEFAULT 0,
  descuento       DECIMAL(12, 2) NOT NULL DEFAULT 0,
  envio           DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total           DECIMAL(12, 2) NOT NULL DEFAULT 0,
  costo           DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ganancia        DECIMAL(12, 2) NOT NULL DEFAULT 0,
  creado_en       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pedidos_usuario (usuario_id),
  KEY idx_pedidos_estado (estado),
  KEY idx_pedidos_pago (pago_id),
  KEY idx_pedidos_fecha (creado_en),
  CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- pedido_items: renglones de cada pedido
-- nombre/precio/costo se copian del producto al comprar;
-- si el producto se borra, producto_id queda en NULL
-- ----------------------------------------------------------
CREATE TABLE pedido_items (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  pedido_id    INT UNSIGNED      NOT NULL,
  producto_id  INT UNSIGNED      NULL,
  nombre       VARCHAR(90)       NOT NULL,
  color        VARCHAR(40)       NULL,
  talle        VARCHAR(12)       NULL,
  precio       DECIMAL(12, 2)    NOT NULL,
  costo        DECIMAL(12, 2)    NOT NULL DEFAULT 0,
  cantidad     SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_items_pedido (pedido_id),
  KEY idx_items_producto (producto_id),
  CONSTRAINT fk_items_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_items_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT ck_items_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- notificaciones: avisos para los administradores
-- (compra nueva, producto con poco stock). leida es compartida
-- entre todos los admins de la tienda.
-- ----------------------------------------------------------
CREATE TABLE notificaciones (
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

-- ----------------------------------------------------------
-- contenido_inicio: textos e imágenes de la página de inicio que
-- se editan desde el panel (Admin → Inicio). Una sola fila (id 1).
-- datos guarda el contenido en JSON; lo que falte se completa con
-- el original de src/data/inicioEditable.js
-- ----------------------------------------------------------
CREATE TABLE contenido_inicio (
  id             TINYINT UNSIGNED NOT NULL DEFAULT 1,
  datos          LONGTEXT     NOT NULL COMMENT 'JSON con el contenido editado',
  usuario_id     INT UNSIGNED NULL COMMENT 'último admin que lo modificó',
  actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_contenido_inicio_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
