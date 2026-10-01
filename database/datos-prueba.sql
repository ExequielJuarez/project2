-- ==========================================================
-- MATILDA BOUTIQUE — Datos de prueba
--
-- Cargar DESPUÉS de schema.sql (borra y vuelve a cargar todo).
-- Las fechas de los pedidos son relativas al momento de la carga
-- (CURDATE() - INTERVAL n DAY / NOW() - INTERVAL n MINUTE), así el
-- panel siempre muestra ventas recientes sin importar cuándo se cargue.
--
-- Usuarios de prueba:
--   Cliente  demo@tienda.com   /  Demo1234
--   Admin    admin@tienda.com  /  Admin1234
--
-- Uso:  npm run db:instalar   (carga schema.sql + este archivo)
--   o:  mysql -u root -p tienda_db < database/datos-prueba.sql
-- ==========================================================

USE tienda_db;

-- Acentos bien guardados aunque el cliente de MySQL no esté en UTF-8
SET NAMES utf8mb4;
-- Misma zona horaria que usa la app (DB_TIMEZONE en el .env), para que
-- CURDATE() y las fechas de los pedidos coincidan con el panel
SET time_zone = '-03:00';

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notificaciones;
TRUNCATE TABLE pedido_items;
TRUNCATE TABLE pedidos;
TRUNCATE TABLE favoritos;
TRUNCATE TABLE especificaciones;
TRUNCATE TABLE producto_imagenes;
TRUNCATE TABLE productos;
TRUNCATE TABLE colores;
TRUNCATE TABLE categorias;
TRUNCATE TABLE cupones;
TRUNCATE TABLE usuarios;
SET FOREIGN_KEY_CHECKS = 1;
ALTER TABLE pedidos AUTO_INCREMENT = 1001;

-- ── Usuarios ─────────────────────────────────────────────
INSERT INTO usuarios (id, nombre, apellido, email, telefono, password, google_id, rol, newsletter) VALUES
  (1, 'Cliente', 'Demo', 'demo@tienda.com', '11 5555 4444', '$2b$10$jX3V6AhKp.Par41X/kOWfelfguSzaU4z/IZkvYOv0UHGBQ/6Rl2Oy', NULL, 'cliente', 1),
  (2, 'Admin', 'Tienda', 'admin@tienda.com', NULL, '$2b$10$OUwf1N16MEgHBa5jhFt6K.cGjo4yUyiF/cOwUOBsyttSBQqgwMRYq', NULL, 'admin', 0),
  (3, 'Ana', 'Pérez', 'ana.perez@gmail.com', NULL, NULL, 'demo-ana.perez@gmail.com', 'cliente', 0),
  (4, 'Super', 'Admin', 'super@tienda.com', NULL, '$2b$10$AhElj/1kwG2mSrQCEpRKI.eaaUIicEpYgvqxK2sckmrfVXodWJpke', NULL, 'superadmin', 0);

-- ── Categorías y colores ────────────────────────────────
INSERT INTO categorias (id, nombre, orden) VALUES
  (1, 'Remeras', 1),
  (2, 'Abrigos', 2),
  (3, 'Jeans y pantalones', 3),
  (4, 'Vestidos', 4),
  (5, 'Accesorios', 5),
  (6, 'Conjuntos', 6);

INSERT INTO colores (id, valor, nombre, hex, orden) VALUES
  (1, 'negro', 'Negro', '#1b1714', 1),
  (2, 'blanco', 'Blanco', '#ffffff', 2),
  (3, 'gris', 'Gris', '#8d8a86', 3),
  (4, 'camel', 'Camel', '#c9a483', 4),
  (5, 'crudo', 'Crudo', '#e8dcc8', 5),
  (6, 'jean', 'Jean', '#7d9bbd', 6);

-- ── Productos ───────────────────────────────────────────
-- talles: lista separada por coma (vacío = talle único)
INSERT INTO productos (id, nombre, categoria_id, color_id, precio, costo, stock, etiqueta, talles, resumen, descripcion, destacados) VALUES
  (1, 'Remera Paris Queens Negra', 1, 1, 25000, 12500, 34, 'Nuevo', 'S,M,L,XL', 'Remera de algodón con la palabra PARIS bordada en perlas a mano. Corte amplio y hombros caídos.', 'La remera que se volvió favorita de la temporada: algodón suave, frente estampado “Queens all the time” y la palabra PARIS bordada con perlas, una por una.

Su corte amplio con hombros caídos la hace fácil de combinar con jean, pantalón sastrero o pollera.', 'Perlas cosidas a mano
Algodón suave de buen gramaje
Corte amplio, hombros caídos
Lavar del revés, agua fría'),
  (2, 'Tapado Largo Camel', 2, 4, 29500, 14000, 18, 'Más vendido', 'S,M,L', 'Tapado largo de paño liviano con solapa y un botón. Cae derecho y combina con todo.', 'Un clásico que no pasa de moda: tapado largo en tono camel, con solapa ancha, un solo botón y bolsillos laterales.

El paño es liviano pero abriga, y el corte recto se lleva abierto o abrochado, sobre un total black o con jean y remera.', 'Paño suave y liviano
Cierre con un botón
Bolsillos laterales
Forrado interior'),
  (3, 'Vestido Midi Satinado Negro', 4, 1, 38500, 19000, 12, NULL, 'S,M,L,XL', 'Vestido midi satinado de breteles finos, con caída fluida. Va de día con campera y de noche con tacos.', 'Satén con caída que se mueve con vos. Escote en V, breteles finos regulables y largo midi.

Se adapta a cualquier ocasión: sumale una campera de jean para el día o tacos y un abrigo camel para la noche.', 'Tela satinada con caída
Breteles regulables
Largo midi
Forro liviano'),
  (4, 'Jean Mom Tiro Alto', 3, 6, 38990, 20500, 22, NULL, '36,38,40,42,44', 'Jean mom de tiro alto, tiro largo y pierna recta. Denim firme que se ablanda con el uso.', 'El jean que todas buscan: tiro alto que estiliza, pierna recta y largo al tobillo. Denim de buen gramaje, rígido al principio y cómodo con el uso.

Combina con remeras bordadas, blazers y zapatillas.', 'Tiro alto y pierna recta
Denim de buen gramaje
Largo al tobillo
5 bolsillos'),
  (5, 'Remera Paris Queens Blanca', 1, 2, 21000, 9800, 40, 'Nuevo', 'S,M,L,XL', 'La versión blanca de nuestra remera con perlas: fresca, luminosa y fácil de combinar.', 'Nuestra remera Paris Queens en blanco puro. Mismo bordado de perlas, mismo calce relajado y un tono que ilumina cualquier look.

Perfecta con jean azul, pantalón camel o pollera negra.', 'Perlas cosidas a mano
Algodón suave
Calce relajado
Hombros caídos'),
  (6, 'Blazer Oversize Gris', 2, 3, 42000, 23500, 15, NULL, 'S,M,L,XL', 'Blazer oversize gris melange, hombros estructurados y forro suave.', 'Hombros marcados, solapa clásica y calce oversize. Un blazer que le da carácter a un jean con remera y se vuelve formal con pantalón sastrero.

Tela con cuerpo, forro suave y bolsillos con tapa.', 'Hombros estructurados
Calce oversize
Bolsillos con tapa
Forro suave'),
  (7, 'Vestido Largo de Noche Negro', 4, 1, 55000, 30000, 6, 'Exclusivo', 'S,M,L', 'Vestido largo negro con espalda descubierta y abertura lateral. Para las noches importantes.', 'Elegante y atemporal: vestido largo con escote en la espalda y abertura lateral. Tela de caída pesada que estiliza la silueta.

Se lleva con poco: unos aros, tacos y listo.', 'Espalda descubierta
Abertura lateral
Tela de caída pesada
Edición limitada'),
  (8, 'Conjunto Lino Blanco', 6, 2, 64900, 36000, 12, NULL, 'S,M,L', 'Conjunto de remera y pantalón de lino. Fresco, liviano y listo para el verano.', 'Dos prendas que se pueden usar juntas o por separado: remera de lino de corte recto y pantalón ancho con cintura elástica.

Un clásico de verano que no se arruga de más y se ve siempre prolijo.', 'Lino liviano y fresco
Pantalón con cintura elástica
Se usa junto o por separado
Bolsillos laterales'),
  (9, 'Pañuelo de Seda Blanco', 5, 2, 18500, 8200, 0, NULL, NULL, 'Pañuelo de seda blanco con ribete dorado. Para el cuello, el pelo o la cartera.', 'Un detalle que cambia todo: pañuelo cuadrado de seda con ribete dorado. Atalo al cuello, a la cartera o como vincha.

Viene en caja de regalo.', 'Seda con ribete dorado
Se usa de mil maneras
Caja de regalo incluida'),
  (10, 'Pantalón Sastrero Camel', 3, 4, 27300, 13100, 27, NULL, 'S,M,L,XL', 'Pantalón sastrero de pierna ancha, cintura alta y pinzas. Elegante con remera o blusa.', 'Pierna ancha, cintura alta y pinzas al frente. Un pantalón de vestir que se lleva todos los días.

En tono camel, hace juego con el tapado de la colección.', 'Cintura alta con pinzas
Pierna ancha
Tela con caída
Bolsillos laterales'),
  (11, 'Cárdigan Tejido Crudo', 2, 5, 31200, 16500, 2, 'Últimas unidades', 'S,M,L', 'Cárdigan tejido en crudo, calce amplio y botones de nácar. Suave y abrigado.', 'Tejido grueso y suave, con botones de nácar y calce amplio. Se usa abierto sobre una remera o abrochado como prenda principal.

El abrigo liviano de entretiempo.', 'Tejido grueso y suave
Botones de nácar
Calce amplio
Últimas unidades'),
  (12, 'Pack Cápsula Matilda x10', 6, 3, 289000, 165000, 5, NULL, 'S,M,L', 'Diez prendas básicas en tonos neutros para armar más de treinta looks. Ideal para renovar el placard.', 'Una selección de diez prendas esenciales —remeras, pantalones, un blazer y un abrigo— en negro, blanco, crudo y gris.

Pensado para quienes quieren un placard simple, versátil y de calidad.', '10 prendas esenciales
Paleta neutra que combina
Más de 30 looks posibles
Envío gratis');

-- ── Fotos de los productos (las de /img/catalogo vienen con el proyecto;
--    las demás se cargan desde el panel admin) ─────────
INSERT INTO producto_imagenes (producto_id, ruta, orden) VALUES
  (1, '/img/catalogo/remera-paris-negra.webp', 0),
  (1, '/img/catalogo/remera-paris-modelo.webp', 1),
  (2, '/img/catalogo/tapado-camel.webp', 0),
  (5, '/img/catalogo/remera-paris-blanca.webp', 0),
  (5, '/img/catalogo/remera-paris-modelo.webp', 1);

-- ── Ficha técnica de cada producto ──────────────────────
INSERT INTO especificaciones (producto_id, clave, valor, orden) VALUES
  (1, 'Composición', '100% algodón', 1),
  (1, 'Calce', 'Amplio', 2),
  (1, 'Largo', 'Cintura alta', 3),
  (1, 'Detalle', 'Bordado de perlas', 4),
  (1, 'Cuidado', 'Lavar del revés, agua fría', 5),
  (1, 'Origen', 'Diseño y confección nacional', 6),
  (2, 'Composición', 'Paño (poliéster, viscosa, lana)', 1),
  (2, 'Calce', 'Recto', 2),
  (2, 'Largo', 'Debajo de la rodilla', 3),
  (2, 'Forro', 'Sí', 4),
  (2, 'Cuidado', 'Limpieza en seco', 5),
  (2, 'Origen', 'Diseño y confección nacional', 6),
  (3, 'Composición', 'Poliéster satinado', 1),
  (3, 'Calce', 'Al cuerpo, fluido', 2),
  (3, 'Largo', 'Midi', 3),
  (3, 'Cuidado', 'Lavar a mano', 4),
  (3, 'Origen', 'Diseño y confección nacional', 5),
  (4, 'Composición', '98% algodón, 2% elastano', 1),
  (4, 'Calce', 'Mom', 2),
  (4, 'Tiro', 'Alto', 3),
  (4, 'Cuidado', 'Lavar del revés, agua fría', 4),
  (4, 'Origen', 'Confección nacional', 5),
  (5, 'Composición', '100% algodón', 1),
  (5, 'Calce', 'Amplio', 2),
  (5, 'Largo', 'Cintura alta', 3),
  (5, 'Detalle', 'Bordado de perlas', 4),
  (5, 'Cuidado', 'Lavar del revés, agua fría', 5),
  (5, 'Origen', 'Diseño y confección nacional', 6),
  (6, 'Composición', 'Poliéster y viscosa', 1),
  (6, 'Calce', 'Oversize', 2),
  (6, 'Largo', 'A la cadera', 3),
  (6, 'Forro', 'Sí', 4),
  (6, 'Cuidado', 'Limpieza en seco', 5),
  (6, 'Origen', 'Diseño y confección nacional', 6),
  (7, 'Composición', 'Crepe de poliéster', 1),
  (7, 'Calce', 'Al cuerpo', 2),
  (7, 'Largo', 'Maxi', 3),
  (7, 'Cuidado', 'Lavar a mano', 4),
  (7, 'Origen', 'Diseño y confección nacional', 5),
  (8, 'Composición', 'Lino y viscosa', 1),
  (8, 'Incluye', 'Remera + pantalón', 2),
  (8, 'Calce', 'Relajado', 3),
  (8, 'Cuidado', 'Lavar a mano o ciclo delicado', 4),
  (8, 'Origen', 'Diseño y confección nacional', 5),
  (9, 'Composición', '100% seda', 1),
  (9, 'Medidas', '90 x 90 cm', 2),
  (9, 'Cuidado', 'Limpieza en seco', 3),
  (9, 'Incluye', 'Caja de regalo', 4),
  (10, 'Composición', 'Poliéster y viscosa', 1),
  (10, 'Calce', 'Pierna ancha', 2),
  (10, 'Tiro', 'Alto', 3),
  (10, 'Cuidado', 'Lavar del revés, ciclo delicado', 4),
  (10, 'Origen', 'Confección nacional', 5),
  (11, 'Composición', 'Acrílico y algodón', 1),
  (11, 'Calce', 'Amplio', 2),
  (11, 'Cuidado', 'Lavar a mano, secar en plano', 3),
  (11, 'Origen', 'Confección nacional', 4),
  (12, 'Incluye', '10 prendas', 1),
  (12, 'Paleta', 'Negro, blanco, crudo, gris', 2),
  (12, 'Cuidado', 'Según etiqueta de cada prenda', 3),
  (12, 'Origen', 'Diseño y confección nacional', 4);

-- ── Cupones ─────────────────────────────────────────────
INSERT INTO cupones (codigo, descripcion, porcentaje, activo, vence_en) VALUES
  ('BIENVENIDA', '10% off en tu primera compra', 0.1000, 1, NULL),
  ('MAQUETA5', '5% off de prueba', 0.0500, 1, NULL),
  ('VERANO20', '20% off de temporada (vencido)', 0.2000, 1, CURDATE() - INTERVAL 10 DAY);

-- ── Favoritos del cliente demo ──────────────────────────
INSERT INTO favoritos (usuario_id, producto_id) VALUES
  (1, 3),
  (1, 7),
  (1, 10);

-- ── Pedidos de los últimos 30 días (80) ─────────────────
INSERT INTO pedidos (id, usuario_id, cliente, email, telefono, entrega, calle, altura, piso, codigo_postal, ciudad, provincia, medio_pago, estado, subtotal, descuento, envio, total, costo, ganancia, creado_en) VALUES
  (1001, 1, 'Cliente Demo', 'demo@tienda.com', '11 47926919', 'domicilio', 'Av. Siempre Viva', '2837', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 25000, 0, 6500, 31500, 12500, 12500, TIMESTAMP(CURDATE() - INTERVAL 29 DAY, '18:41:00')),
  (1002, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 47934838', 'domicilio', 'Av. Siempre Viva', '2874', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 68000, 6800, 0, 61200, 33000, 28200, TIMESTAMP(CURDATE() - INTERVAL 29 DAY, '13:10:00')),
  (1003, NULL, 'Facundo Ruiz', 'facundo.ruiz@mail.com', '11 47942757', 'domicilio', 'Av. Siempre Viva', '2911', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'entregado', 42000, 4200, 0, 37800, 19600, 18200, TIMESTAMP(CURDATE() - INTERVAL 29 DAY, '10:15:00')),
  (1004, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 47950676', 'domicilio', 'Av. Siempre Viva', '2948', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 38990, 0, 0, 38990, 20500, 18490, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '11:01:00')),
  (1005, NULL, 'Mateo Sánchez', 'mateo.sanchez@mail.com', '11 47958595', 'domicilio', 'Av. Siempre Viva', '2985', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 25000, 0, 6500, 31500, 12500, 12500, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '17:41:00')),
  (1006, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 47966514', 'domicilio', 'Av. Siempre Viva', '3022', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 29500, 0, 6500, 36000, 14000, 15500, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '16:16:00')),
  (1007, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 47974433', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 27300, 0, 6500, 33800, 13100, 14200, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '13:14:00')),
  (1008, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 47982352', 'domicilio', 'Av. Siempre Viva', '3096', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 64900, 0, 0, 64900, 36000, 28900, TIMESTAMP(CURDATE() - INTERVAL 27 DAY, '14:18:00')),
  (1009, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 47990271', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 55000, 0, 6500, 61500, 30000, 25000, TIMESTAMP(CURDATE() - INTERVAL 27 DAY, '17:33:00')),
  (1010, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 47998190', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 289000, 0, 0, 289000, 165000, 124000, TIMESTAMP(CURDATE() - INTERVAL 26 DAY, '11:17:00')),
  (1011, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48006109', 'domicilio', 'Av. Siempre Viva', '3207', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'entregado', 86300, 8630, 0, 77670, 41100, 36570, TIMESTAMP(CURDATE() - INTERVAL 25 DAY, '15:41:00')),
  (1012, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48014028', 'domicilio', 'Av. Siempre Viva', '3244', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'transferencia', 'entregado', 31200, 3120, 0, 28080, 16500, 11580, TIMESTAMP(CURDATE() - INTERVAL 25 DAY, '20:44:00')),
  (1013, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48021947', 'domicilio', 'Av. Siempre Viva', '3281', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 38500, 0, 0, 38500, 19000, 19500, TIMESTAMP(CURDATE() - INTERVAL 25 DAY, '17:41:00')),
  (1014, 1, 'Cliente Demo', 'demo@tienda.com', '11 48029866', 'domicilio', 'Av. Siempre Viva', '3318', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 31200, 3120, 0, 28080, 16500, 11580, TIMESTAMP(CURDATE() - INTERVAL 24 DAY, '20:27:00')),
  (1015, NULL, 'Martín Gómez', 'martin.gomez@mail.com', '11 48037785', 'domicilio', 'Av. Siempre Viva', '3355', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 102980, 0, 6500, 109480, 53500, 49480, TIMESTAMP(CURDATE() - INTERVAL 24 DAY, '13:57:00')),
  (1016, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48045704', 'domicilio', 'Av. Siempre Viva', '3392', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'entregado', 31200, 3120, 0, 28080, 16500, 11580, TIMESTAMP(CURDATE() - INTERVAL 24 DAY, '15:30:00')),
  (1017, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48053623', 'domicilio', 'Av. Siempre Viva', '3429', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 27300, 0, 6500, 33800, 13100, 14200, TIMESTAMP(CURDATE() - INTERVAL 23 DAY, '14:49:00')),
  (1018, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48061542', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'entregado', 55000, 5500, 6500, 56000, 30000, 19500, TIMESTAMP(CURDATE() - INTERVAL 22 DAY, '15:42:00')),
  (1019, NULL, 'Facundo Ruiz', 'facundo.ruiz@mail.com', '11 48069461', 'domicilio', 'Av. Siempre Viva', '3503', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 59500, 0, 6500, 66000, 28800, 30700, TIMESTAMP(CURDATE() - INTERVAL 22 DAY, '14:22:00')),
  (1020, NULL, 'Lucía Fernández', 'lucia.fernandez@mail.com', '11 48077380', 'domicilio', 'Av. Siempre Viva', '3540', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 327990, 0, 0, 327990, 185500, 142490, TIMESTAMP(CURDATE() - INTERVAL 21 DAY, '20:30:00')),
  (1021, NULL, 'Juan Pérez', 'juan.perez@mail.com', '11 48085299', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 143000, 0, 0, 143000, 75000, 68000, TIMESTAMP(CURDATE() - INTERVAL 21 DAY, '10:54:00')),
  (1022, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48093218', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 25000, 0, 6500, 31500, 12500, 12500, TIMESTAMP(CURDATE() - INTERVAL 21 DAY, '20:44:00')),
  (1023, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48101137', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'entregado', 38990, 3899, 6500, 41591, 20500, 14591, TIMESTAMP(CURDATE() - INTERVAL 21 DAY, '19:51:00')),
  (1024, NULL, 'Lucía Fernández', 'lucia.fernandez@mail.com', '11 48109056', 'domicilio', 'Av. Siempre Viva', '3688', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'entregado', 55000, 5500, 6500, 56000, 30000, 19500, TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '19:52:00')),
  (1025, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48116975', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 38500, 0, 0, 38500, 19000, 19500, TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '16:16:00')),
  (1026, NULL, 'Santiago Morales', 'santiago.morales@mail.com', '11 48124894', 'domicilio', 'Av. Siempre Viva', '3762', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 43500, 0, 6500, 50000, 20700, 22800, TIMESTAMP(CURDATE() - INTERVAL 19 DAY, '13:36:00')),
  (1027, 1, 'Cliente Demo', 'demo@tienda.com', '11 48132813', 'domicilio', 'Av. Siempre Viva', '3799', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'entregado', 31200, 0, 6500, 37700, 16500, 14700, TIMESTAMP(CURDATE() - INTERVAL 19 DAY, '16:36:00')),
  (1028, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48140732', 'domicilio', 'Av. Siempre Viva', '3836', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'entregado', 102500, 10250, 6500, 98750, 55200, 37050, TIMESTAMP(CURDATE() - INTERVAL 19 DAY, '20:23:00')),
  (1029, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48148651', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 38990, 0, 0, 38990, 20500, 18490, TIMESTAMP(CURDATE() - INTERVAL 18 DAY, '17:28:00')),
  (1030, NULL, 'Santiago Morales', 'santiago.morales@mail.com', '11 48156570', 'domicilio', 'Av. Siempre Viva', '3910', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'transferencia', 'entregado', 42000, 4200, 6500, 44300, 23500, 14300, TIMESTAMP(CURDATE() - INTERVAL 17 DAY, '21:24:00')),
  (1031, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48164489', 'domicilio', 'Av. Siempre Viva', '3947', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'cancelado', 96600, 0, 6500, 103100, 45800, 50800, TIMESTAMP(CURDATE() - INTERVAL 17 DAY, '18:44:00')),
  (1032, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48172408', 'domicilio', 'Av. Siempre Viva', '3984', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'entregado', 84500, 0, 6500, 91000, 44000, 40500, TIMESTAMP(CURDATE() - INTERVAL 17 DAY, '13:32:00')),
  (1033, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48180327', 'domicilio', 'Av. Siempre Viva', '4021', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'transferencia', 'entregado', 103890, 10389, 6500, 100001, 56500, 37001, TIMESTAMP(CURDATE() - INTERVAL 16 DAY, '12:56:00')),
  (1034, NULL, 'Santiago Morales', 'santiago.morales@mail.com', '11 48188246', 'domicilio', 'Av. Siempre Viva', '4058', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 97990, 0, 6500, 104490, 48500, 49490, TIMESTAMP(CURDATE() - INTERVAL 16 DAY, '15:35:00')),
  (1035, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48196165', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 48300, 0, 0, 48300, 22900, 25400, TIMESTAMP(CURDATE() - INTERVAL 16 DAY, '14:48:00')),
  (1036, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48204084', 'domicilio', 'Av. Siempre Viva', '4132', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 55000, 0, 6500, 61500, 30000, 25000, TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '12:54:00')),
  (1037, NULL, 'Martín Gómez', 'martin.gomez@mail.com', '11 48212003', 'domicilio', 'Av. Siempre Viva', '4169', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'entregado', 42000, 0, 0, 42000, 23500, 18500, TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '18:24:00')),
  (1038, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48219922', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 29500, 0, 6500, 36000, 14000, 15500, TIMESTAMP(CURDATE() - INTERVAL 14 DAY, '16:43:00')),
  (1039, NULL, 'Julieta Romero', 'julieta.romero@mail.com', '11 48227841', 'domicilio', 'Av. Siempre Viva', '4243', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 42000, 4200, 6500, 44300, 23500, 14300, TIMESTAMP(CURDATE() - INTERVAL 14 DAY, '16:19:00')),
  (1040, 1, 'Cliente Demo', 'demo@tienda.com', '11 48235760', 'domicilio', 'Av. Siempre Viva', '4280', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 86200, 0, 6500, 92700, 46500, 39700, TIMESTAMP(CURDATE() - INTERVAL 14 DAY, '15:10:00')),
  (1041, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48243679', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 60500, 0, 6500, 67000, 27800, 32700, TIMESTAMP(CURDATE() - INTERVAL 13 DAY, '11:49:00')),
  (1042, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48251598', 'domicilio', 'Av. Siempre Viva', '4354', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 64900, 0, 6500, 71400, 36000, 28900, TIMESTAMP(CURDATE() - INTERVAL 13 DAY, '15:52:00')),
  (1043, NULL, 'Juan Pérez', 'juan.perez@mail.com', '11 48259517', 'domicilio', 'Av. Siempre Viva', '4391', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'cancelado', 96100, 0, 6500, 102600, 52500, 43600, TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '10:22:00')),
  (1044, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48267436', 'domicilio', 'Av. Siempre Viva', '4428', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'cancelado', 31200, 3120, 6500, 34580, 16500, 11580, TIMESTAMP(CURDATE() - INTERVAL 11 DAY, '19:03:00')),
  (1045, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48275355', 'domicilio', 'Av. Siempre Viva', '4465', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'entregado', 55000, 0, 6500, 61500, 30000, 25000, TIMESTAMP(CURDATE() - INTERVAL 11 DAY, '21:24:00')),
  (1046, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48283274', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'entregado', 80500, 8050, 6500, 78950, 42500, 29950, TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '19:13:00')),
  (1047, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48291193', 'domicilio', 'Av. Siempre Viva', '4539', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 21000, 0, 6500, 27500, 9800, 11200, TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '21:06:00')),
  (1048, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48299112', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 42000, 0, 6500, 48500, 19600, 22400, TIMESTAMP(CURDATE() - INTERVAL 9 DAY, '13:14:00')),
  (1049, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 48307031', 'domicilio', 'Av. Siempre Viva', '4613', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 42000, 4200, 6500, 44300, 23500, 14300, TIMESTAMP(CURDATE() - INTERVAL 9 DAY, '14:18:00')),
  (1050, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48314950', 'domicilio', 'Av. Siempre Viva', '4650', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'cancelado', 38500, 0, 6500, 45000, 19000, 19500, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '21:15:00')),
  (1051, NULL, 'Tomás Díaz', 'tomas.diaz@mail.com', '11 48322869', 'domicilio', 'Av. Siempre Viva', '4687', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 38990, 0, 0, 38990, 20500, 18490, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '09:35:00')),
  (1052, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 48330788', 'domicilio', 'Av. Siempre Viva', '4724', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 55000, 0, 6500, 61500, 30000, 25000, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '09:22:00')),
  (1053, 1, 'Cliente Demo', 'demo@tienda.com', '11 48338707', 'domicilio', 'Av. Siempre Viva', '4761', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 97000, 0, 0, 97000, 53500, 43500, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '16:13:00')),
  (1054, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48346626', 'domicilio', 'Av. Siempre Viva', '4798', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 77000, 7700, 6500, 75800, 38000, 31300, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '14:48:00')),
  (1055, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48354545', 'domicilio', 'Av. Siempre Viva', '4835', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 343600, 0, 0, 343600, 191200, 152400, TIMESTAMP(CURDATE() - INTERVAL 7 DAY, '17:54:00')),
  (1056, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48362464', 'domicilio', 'Av. Siempre Viva', '4872', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'transferencia', 'enviado', 42000, 4200, 6500, 44300, 23500, 14300, TIMESTAMP(CURDATE() - INTERVAL 7 DAY, '20:59:00')),
  (1057, NULL, 'Lucía Fernández', 'lucia.fernandez@mail.com', '11 48370383', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'cancelado', 21000, 0, 6500, 27500, 9800, 11200, TIMESTAMP(CURDATE() - INTERVAL 7 DAY, '14:50:00')),
  (1058, NULL, 'Facundo Ruiz', 'facundo.ruiz@mail.com', '11 48378302', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'enviado', 38500, 0, 6500, 45000, 19000, 19500, TIMESTAMP(CURDATE() - INTERVAL 7 DAY, '21:52:00')),
  (1059, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48386221', 'domicilio', 'Av. Siempre Viva', '4983', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 289000, 0, 0, 289000, 165000, 124000, TIMESTAMP(CURDATE() - INTERVAL 6 DAY, '14:47:00')),
  (1060, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48394140', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'enviado', 38500, 3850, 6500, 41150, 19000, 15650, TIMESTAMP(CURDATE() - INTERVAL 6 DAY, '09:18:00')),
  (1061, NULL, 'Santiago Morales', 'santiago.morales@mail.com', '11 48402059', 'domicilio', 'Av. Siempre Viva', '157', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'enviado', 29500, 0, 6500, 36000, 14000, 15500, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '21:53:00')),
  (1062, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48409978', 'domicilio', 'Av. Siempre Viva', '194', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'enviado', 115200, 11520, 6500, 110180, 63500, 40180, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '11:29:00')),
  (1063, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48417897', 'domicilio', 'Av. Siempre Viva', '231', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 55000, 0, 6500, 61500, 30000, 25000, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '13:19:00')),
  (1064, NULL, 'Facundo Ruiz', 'facundo.ruiz@mail.com', '11 48425816', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 31200, 0, 6500, 37700, 16500, 14700, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '17:33:00')),
  (1065, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48433735', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'enviado', 42000, 0, 0, 42000, 23500, 18500, TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '13:06:00')),
  (1066, 1, 'Cliente Demo', 'demo@tienda.com', '11 48441654', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'enviado', 62400, 0, 0, 62400, 33000, 29400, TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '12:30:00')),
  (1067, NULL, 'Lucía Fernández', 'lucia.fernandez@mail.com', '11 48449573', 'domicilio', 'Av. Siempre Viva', '379', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'entregado', 59990, 5999, 6500, 60491, 30300, 23691, TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '19:47:00')),
  (1068, NULL, 'Mateo Sánchez', 'mateo.sanchez@mail.com', '11 48457492', 'domicilio', 'Av. Siempre Viva', '416', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'pagado', 29500, 2950, 6500, 33050, 14000, 12550, TIMESTAMP(CURDATE() - INTERVAL 3 DAY, '11:54:00')),
  (1069, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48465411', 'domicilio', 'Av. Siempre Viva', '453', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'enviado', 21000, 2100, 6500, 25400, 9800, 9100, TIMESTAMP(CURDATE() - INTERVAL 3 DAY, '20:18:00')),
  (1070, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48473330', 'domicilio', 'Av. Siempre Viva', '490', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'enviado', 31200, 3120, 6500, 34580, 16500, 11580, TIMESTAMP(CURDATE() - INTERVAL 3 DAY, '11:23:00')),
  (1071, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48481249', 'domicilio', 'Av. Siempre Viva', '527', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'cancelado', 42000, 0, 0, 42000, 23500, 18500, TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '11:30:00')),
  (1072, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48489168', 'domicilio', 'Av. Siempre Viva', '564', NULL, '2000', 'Rosario', 'Santa Fe', 'transferencia', 'pagado', 107480, 10748, 6500, 103232, 55000, 41732, TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '12:31:00')),
  (1073, NULL, 'Martín Gómez', 'martin.gomez@mail.com', '11 48497087', 'domicilio', 'Av. Siempre Viva', '601', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'pagado', 38990, 0, 6500, 45490, 20500, 18490, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '09:57:00')),
  (1074, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 48505006', 'domicilio', 'Av. Siempre Viva', '638', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'pagado', 84000, 0, 0, 84000, 47000, 37000, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '09:09:00')),
  (1075, NULL, 'Mateo Sánchez', 'mateo.sanchez@mail.com', '11 48512925', 'domicilio', 'Av. Siempre Viva', '675', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'pagado', 38990, 3899, 0, 35091, 20500, 14591, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '21:57:00')),
  (1076, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48520844', 'domicilio', 'Av. Siempre Viva', '712', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'pendiente', 55000, 5500, 6500, 56000, 30000, 19500, NOW() - INTERVAL 32 MINUTE),
  (1077, NULL, 'Tomás Díaz', 'tomas.diaz@mail.com', '11 48528763', 'domicilio', 'Av. Siempre Viva', '749', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'pagado', 37000, 0, 0, 37000, 16400, 20600, NOW() - INTERVAL 109 MINUTE),
  (1078, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48536682', 'domicilio', 'Av. Siempre Viva', '786', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'pagado', 38990, 0, 6500, 45490, 20500, 18490, NOW() - INTERVAL 145 MINUTE),
  (1079, 1, 'Cliente Demo', 'demo@tienda.com', '11 48544601', 'domicilio', 'Av. Siempre Viva', '823', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'pagado', 289000, 0, 0, 289000, 165000, 124000, NOW() - INTERVAL 184 MINUTE),
  (1080, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48552520', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'pendiente', 55000, 5500, 0, 49500, 30000, 19500, NOW() - INTERVAL 253 MINUTE);

-- Cobro: los pedidos pagados/enviados/entregados tienen el pago aprobado
UPDATE pedidos SET pago_estado = 'aprobado', pagado_en = creado_en
WHERE estado IN ('pagado', 'enviado', 'entregado');
UPDATE pedidos
SET pago_detalle = ELT(1 + MOD(id, 4), 'Visa terminada en 4242 · 3 cuotas', 'Mastercard terminada en 5100 · 1 cuota',
                       'Naranja terminada en 6019 · 6 cuotas', 'Dinero en cuenta de Mercado Pago'),
    pago_id = CONCAT('demo-', id)
WHERE medio_pago = 'tarjeta' AND pago_estado = 'aprobado';
UPDATE pedidos SET pago_detalle = 'Transferencia acreditada'
WHERE medio_pago = 'transferencia' AND pago_estado = 'aprobado';

-- Dirección guardada del cliente demo (se usa para completar el checkout)
UPDATE usuarios SET dni = '30111222', calle = 'Av. Siempre Viva', altura = '2837', codigo_postal = '1405',
       ciudad = 'CABA', provincia = 'Ciudad Autónoma de Buenos Aires'
WHERE email = 'demo@tienda.com';

UPDATE pedidos SET actualizado_en = creado_en;

-- ── Renglones de los pedidos (102) ─────────────────────────
INSERT INTO pedido_items (pedido_id, producto_id, nombre, color, precio, costo, cantidad) VALUES
  (1001, 1, 'Remera Paris Queens Negra', 'Negro', 25000, 12500, 1),
  (1002, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 1),
  (1002, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 1),
  (1003, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 2),
  (1004, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1005, 1, 'Remera Paris Queens Negra', 'Negro', 25000, 12500, 1),
  (1006, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 1),
  (1007, 10, 'Pantalón Sastrero Camel', 'Camel', 27300, 13100, 1),
  (1008, 8, 'Conjunto Lino Blanco', 'Blanco', 64900, 36000, 1),
  (1009, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1010, 12, 'Pack Cápsula Matilda x10', 'Gris', 289000, 165000, 1),
  (1011, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 2),
  (1011, 10, 'Pantalón Sastrero Camel', 'Camel', 27300, 13100, 1),
  (1012, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1013, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 1),
  (1014, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1015, 1, 'Remera Paris Queens Negra', 'Negro', 25000, 12500, 1),
  (1015, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 2),
  (1016, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1017, 10, 'Pantalón Sastrero Camel', 'Camel', 27300, 13100, 1),
  (1018, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1019, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 1),
  (1019, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 1),
  (1020, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1020, 12, 'Pack Cápsula Matilda x10', 'Gris', 289000, 165000, 1),
  (1021, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 2),
  (1021, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 2),
  (1022, 1, 'Remera Paris Queens Negra', 'Negro', 25000, 12500, 1),
  (1023, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1024, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1025, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 1),
  (1026, 1, 'Remera Paris Queens Negra', 'Negro', 25000, 12500, 1),
  (1026, 9, 'Pañuelo de Seda Blanco', 'Blanco', 18500, 8200, 1),
  (1027, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1028, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 2),
  (1028, 9, 'Pañuelo de Seda Blanco', 'Blanco', 18500, 8200, 1),
  (1029, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1030, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1031, 10, 'Pantalón Sastrero Camel', 'Camel', 27300, 13100, 2),
  (1031, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 2),
  (1032, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1032, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 1),
  (1033, 8, 'Conjunto Lino Blanco', 'Blanco', 64900, 36000, 1),
  (1033, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1034, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 2),
  (1034, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1035, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 1),
  (1035, 10, 'Pantalón Sastrero Camel', 'Camel', 27300, 13100, 1),
  (1036, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1037, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1038, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 1),
  (1039, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1040, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1040, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1041, 9, 'Pañuelo de Seda Blanco', 'Blanco', 18500, 8200, 1),
  (1041, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 2),
  (1042, 8, 'Conjunto Lino Blanco', 'Blanco', 64900, 36000, 1),
  (1043, 8, 'Conjunto Lino Blanco', 'Blanco', 64900, 36000, 1),
  (1043, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1044, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1045, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1046, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1046, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 1),
  (1047, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 1),
  (1048, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 2),
  (1049, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1050, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 1),
  (1051, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1052, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1053, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1053, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1054, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 2),
  (1055, 12, 'Pack Cápsula Matilda x10', 'Gris', 289000, 165000, 1),
  (1055, 10, 'Pantalón Sastrero Camel', 'Camel', 27300, 13100, 2),
  (1056, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1057, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 1),
  (1058, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 1),
  (1059, 12, 'Pack Cápsula Matilda x10', 'Gris', 289000, 165000, 1),
  (1060, 3, 'Vestido Midi Satinado Negro', 'Negro', 38500, 19000, 1),
  (1061, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 1),
  (1062, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 2),
  (1062, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1063, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1064, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1065, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1066, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 2),
  (1067, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 1),
  (1067, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1068, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 1),
  (1069, 5, 'Remera Paris Queens Blanca', 'Blanco', 21000, 9800, 1),
  (1070, 11, 'Cárdigan Tejido Crudo', 'Crudo', 31200, 16500, 1),
  (1071, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 1),
  (1072, 2, 'Tapado Largo Camel', 'Camel', 29500, 14000, 1),
  (1072, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 2),
  (1073, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1074, 6, 'Blazer Oversize Gris', 'Gris', 42000, 23500, 2),
  (1075, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1076, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1),
  (1077, 9, 'Pañuelo de Seda Blanco', 'Blanco', 18500, 8200, 2),
  (1078, 4, 'Jean Mom Tiro Alto', 'Jean', 38990, 20500, 1),
  (1079, 12, 'Pack Cápsula Matilda x10', 'Gris', 289000, 165000, 1),
  (1080, 7, 'Vestido Largo de Noche Negro', 'Negro', 55000, 30000, 1);

-- Talle de cada renglón (rotando entre los talles de la prenda; los accesorios no tienen)
UPDATE pedido_items i JOIN productos p ON p.id = i.producto_id
   SET i.talle = SUBSTRING_INDEX(SUBSTRING_INDEX(p.talles, ',', 1 + MOD(i.id, LENGTH(p.talles) - LENGTH(REPLACE(p.talles, ',', '')) + 1)), ',', -1)
 WHERE p.talles IS NOT NULL;

ALTER TABLE pedidos AUTO_INCREMENT = 1081;

-- ── Notificaciones para el admin (las 2 compras más recientes, sin leer) ──
INSERT INTO notificaciones (tipo, titulo, mensaje, url, pedido_id, leida, creado_en)
SELECT 'pedido',
       CONCAT('Nueva compra #', id),
       CONCAT(cliente, ' · $', FORMAT(total, 2, 'es_AR')),
       CONCAT('/admin/pedidos?q=', id),
       id, 0, creado_en
  FROM pedidos
 ORDER BY creado_en DESC
 LIMIT 2;
