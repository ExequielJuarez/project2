-- ==========================================================
-- MATILDA BOUTIQUE — Datos de prueba
--
-- Cargar DESPUÉS de schema.sql (borra y vuelve a cargar todo).
-- Trae el catálogo de ropa con sus fotos (public/img/productos), usuarios
-- de prueba y cupones. No trae pedidos: las ventas las generan los clientes.
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
  (6, 'jean', 'Jean', '#7d9bbd', 6),
  (7, 'marron', 'Marrón', '#6b4a3a', 7),
  (8, 'bordo', 'Bordó', '#4a1f24', 8),
  (9, 'celeste', 'Celeste', '#a9c4de', 9),
  (10, 'azul', 'Azul', '#27466e', 10),
  (11, 'terracota', 'Terracota', '#b5714f', 11),
  (12, 'plata', 'Plata', '#c4c4c4', 12),
  (13, 'arena', 'Arena', '#d9c3a5', 13),
  (14, 'amarillo', 'Amarillo', '#f1e3a1', 14),
  (15, 'rayado', 'Rayado', '#bdbdbd', 15);

-- ── Productos ───────────────────────────────────────────
-- talles: lista separada por coma (vacío = talle único)
INSERT INTO productos (id, nombre, categoria_id, color_id, precio, costo, stock, etiqueta, talles, resumen, descripcion, destacados) VALUES
  (1, 'Remera Wanderlust Crema', 1, 5, 19500, 9000, 24, 'Nuevo', 'S,M,L,XL', 'Remera de algodón crema con estampado “Wanderlust Book Club”. Calce relajado.', 'Una remera con personalidad: estampado vintage de club de lectura sobre algodón suave color crema.

Calce relajado, cuello redondo y largo cintura. Combina con jeans, polleras y shorts.', 'Estampado vintage
Algodón suave
Calce relajado'),
  (2, 'Remera The Beach Club Blanca', 1, 2, 19500, 9000, 30, NULL, 'S,M,L,XL', 'Remera blanca con estampado azul de conchas “The Beach Club”.', 'Fresca y fácil de usar: algodón blanco con estampado azul de inspiración marina.

Perfecta para el verano con short, pollera o jean.', 'Estampado azul
Algodón liviano
Usos infinitos'),
  (3, 'Chaleco Rayado con Botones', 1, 15, 24900, 11500, 14, 'Más vendido', 'S,M,L', 'Chaleco de lino rayado blanco y negro con botones. Se usa sobre una remera o solo.', 'Un chaleco que cambia cualquier look: rayas blanco y negro, escote en V y botones al frente.

Se usa sobre una remera lisa o solo, con pantalón o pollera.', 'Rayas clásicas
Botones al frente
Tela fresca'),
  (4, 'Remera Roma Blanca', 1, 2, 19500, 9000, 18, NULL, 'S,M,L,XL', 'Remera blanca con estampado de la Fontana de Trevi. Calce amplio.', 'Un souvenir de Roma en tu placard: estampado de la Fontana de Trevi sobre algodón blanco.

Calce amplio y cuello redondo.', 'Estampado artístico
Algodón suave
Calce amplio'),
  (5, 'Camisa Bordada Blanca', 1, 2, 32900, 15500, 9, 'Exclusivo', 'S,M,L', 'Camisa blanca con bordado calado y mangas largas. Delicada y atemporal.', 'Bordado calado en todo el frente y las mangas, con cuello bebé y botones.

Queda divina con jean o con pantalón sastrero.', 'Bordado calado
Cuello bebé
Edición limitada'),
  (6, 'Remera Paris Queens Negra', 1, 1, 25000, 12500, 34, 'Nuevo', 'S,M,L,XL', 'Remera de algodón con la palabra PARIS bordada en perlas a mano. Corte amplio.', 'La remera favorita de la temporada: algodón suave, estampado “Queens all the time” y la palabra PARIS bordada con perlas, una por una.

Corte amplio con hombros caídos.', 'Perlas cosidas a mano
Algodón suave
Hombros caídos'),
  (7, 'Remera Paris Queens Blanca', 1, 2, 25000, 12500, 40, 'Nuevo', 'S,M,L,XL', 'La versión blanca de nuestra remera con perlas: luminosa y fácil de combinar.', 'Mismo bordado de perlas, mismo calce relajado y un tono que ilumina cualquier look.

Perfecta con jean azul o pantalón camel.', 'Perlas cosidas a mano
Algodón suave
Calce relajado'),
  (8, 'Campera Cuero Eco Bordó', 2, 8, 89000, 48000, 8, 'Nuevo', 'S,M,L,XL', 'Campera de cuero ecológico bordó con cierre cruzado y cinto en la cintura.', 'Campera de eco cuero con solapa ancha, cierre al costado y ajuste con hebilla en la cintura.

Disponible también en negro y chocolate.', 'Cuero ecológico
Ajuste con hebilla
Forrada'),
  (9, 'Campera Gamuzada Marrón', 2, 7, 78000, 41000, 11, NULL, 'S,M,L,XL', 'Campera de gamuza sintética con interior de corderito. Abriga y se ve increíble.', 'Gamuza sintética suave con forro interior tipo corderito. Cuello camisero, botones a presión y bajo elastizado.

La campera de media estación que todas quieren.', 'Interior de corderito
Botones a presión
Bajo elastizado'),
  (10, 'Campera Biker Chocolate', 2, 7, 92000, 50000, 6, 'Últimas unidades', 'S,M,L,XL', 'Campera biker de eco cuero color chocolate con cinto y cierres plateados.', 'Clásica campera biker con solapas, cierre cruzado y cinto. Eco cuero con efecto envejecido.

Combina con todo: jean, vestidos, polleras.', 'Efecto envejecido
Cierre cruzado
Cinto regulable'),
  (11, 'Campera Jean Vintage', 2, 6, 54000, 27000, 13, NULL, 'S,M,L,XL', 'Campera de jean con lavado vintage, calce oversize y bolsillos con botón.', 'Denim con lavado desgastado de estilo vintage, bolsillos en el pecho y calce oversize.

Un básico que no pasa de moda.', 'Lavado vintage
Calce oversize
Bolsillos con botón'),
  (12, 'Campera Jean Celeste', 2, 9, 54000, 27000, 15, NULL, 'S,M,L,XL', 'Campera de jean celeste claro, calce amplio y botones metálicos.', 'Denim celeste de lavado suave, calce amplio y largo a la cadera.

Ideal con vestidos y remeras blancas.', 'Denim celeste
Calce amplio
Botones metálicos'),
  (13, 'Tapado Largo Camel', 2, 4, 119000, 62000, 18, 'Más vendido', 'S,M,L', 'Tapado largo de paño liviano con solapa y un botón. Cae derecho y combina con todo.', 'Un clásico que no pasa de moda: tapado largo en tono camel, con solapa ancha, un solo botón y bolsillos laterales.

El paño es liviano pero abriga.', 'Paño suave y liviano
Un botón
Bolsillos laterales'),
  (14, 'Vestido Corto Crudo Breteles', 4, 5, 36900, 17500, 12, NULL, 'S,M,L,XL', 'Vestido corto crudo de breteles finos y espalda con tiras cruzadas.', 'Vestido de lino liviano con breteles finos, espalda cruzada y bajo con abertura.

Perfecto para el día de verano.', 'Espalda cruzada
Lino liviano
Bajo con abertura'),
  (15, 'Vestido Blanco Mangas Globo', 4, 2, 39900, 19000, 10, 'Nuevo', 'S,M,L,XL', 'Vestido blanco corto con mangas globo y vuelo en capas.', 'Mangas globo, cuello redondo y falda con vuelo en capas. Algodón liviano.

Un vestido romántico y cómodo.', 'Mangas globo
Falda en capas
Algodón liviano'),
  (16, 'Vestido Halter Crudo', 4, 5, 37900, 18000, 9, NULL, 'S,M,L,XL', 'Vestido halter con botones al frente y espalda descubierta.', 'Escote halter, botones al frente y espalda descubierta. Tela de lino fresca.

Se usa con sandalias en verano o con campera de jean.', 'Escote halter
Botones al frente
Lino fresco'),
  (17, 'Vestido Largo Floral Blanco', 4, 2, 52900, 26000, 7, 'Exclusivo', 'S,M,L', 'Vestido largo blanco con estampado floral, escote cruzado y cintura elastizada.', 'Vestido largo de escote cruzado, breteles finos y cintura elastizada que marca la silueta.

Estampado floral en tonos tierra.', 'Escote cruzado
Cintura elastizada
Largo maxi'),
  (18, 'Vestido Largo Terracota Estampado', 4, 11, 54900, 27500, 5, NULL, 'S,M,L', 'Vestido largo con estampado en tonos terracota, espalda al aire y escote en V.', 'Escote en V profundo, espalda descubierta y estampado en tonos terracota y beige.

Fresco, fluido y muy favorecedor.', 'Espalda al aire
Estampado exclusivo
Tela fluida'),
  (19, 'Jean Azul Oscuro Acampanado', 3, 10, 49900, 24000, 16, 'Nuevo', '36,38,40,42,44', 'Jean azul oscuro de tiro alto con pierna acampanada.', 'Denim azul oscuro, tiro alto y pierna acampanada que estiliza.

Combina con remeras bordadas y blazers.', 'Tiro alto
Pierna acampanada
Denim de buen gramaje'),
  (20, 'Jean Recto Tiro Alto Celeste', 3, 9, 49900, 24000, 20, 'Más vendido', '36,38,40,42,44', 'Jean celeste de tiro alto y pierna recta, largo al tobillo.', 'El jean que todas buscan: celeste lavado, tiro alto y pierna recta.

Denim firme que se ablanda con el uso.', 'Tiro alto
Pierna recta
Largo al tobillo'),
  (21, 'Jean Wide Leg Azul', 3, 6, 51900, 25000, 14, NULL, '36,38,40,42,44', 'Jean wide leg azul, pierna ancha y tiro alto.', 'Pierna ancha, tiro alto y lavado medio. Un jean cómodo y canchero.

Ideal con zapatillas o con tacos.', 'Pierna ancha
Tiro alto
Lavado medio'),
  (22, 'Pantalón Sastrero Marrón', 3, 7, 46900, 22500, 12, NULL, 'S,M,L,XL', 'Pantalón sastrero marrón de pierna ancha, cintura elástica y pinzas.', 'Pierna ancha, pinzas al frente y cintura con elástico posterior para mayor comodidad.

Se lleva con remeras, camisas y blazers.', 'Pinzas al frente
Cintura cómoda
Tela con caída'),
  (23, 'Aros Argolla Plata 925 con Estrella', 5, 12, 14900, 6000, 25, 'Nuevo', NULL, 'Aros argolla de plata 925 con dije de estrella. Vienen en caja.', 'Argollas de plata 925 con dijes de estrella. Livianos y delicados para usar todos los días.

Se entregan en caja de regalo.', 'Plata 925
Dije de estrella
Caja de regalo'),
  (24, 'Pulseras Rígidas Plata y Rosé', 5, 12, 12900, 5000, 0, NULL, NULL, 'Pulseras rígidas martilladas en plata y baño rosé.', 'Pulseras rígidas abiertas con textura martillada. Se usan solas o apiladas.

Disponibles en plata y rosé.', 'Textura martillada
Se apilan
Ajustables'),
  (25, 'Conjunto Blusa Blanca y Mini Arena', 6, 13, 58900, 29000, 10, 'Nuevo', 'S,M,L', 'Blusa blanca de mangas largas con mini pollera arena con volados.', 'Blusa blanca fruncida con mangas largas y mini pollera con volados en tono arena.

Se usan juntas o por separado.', 'Se usa junto o separado
Volados
Tela liviana'),
  (26, 'Conjunto Camisa y Short Marrón', 6, 7, 54900, 27000, 8, NULL, 'S,M,L', 'Camisa blanca con short marrón de bordado calado.', 'Camisa blanca de mangas cortas y short marrón con bordado calado y cintura elástica.

Un conjunto fresco para el verano.', 'Short bordado
Cintura elástica
Tela fresca'),
  (27, 'Conjunto Top Amarillo y Short Arena', 6, 14, 52900, 26000, 9, NULL, 'S,M,L', 'Top amarillo pastel con volados y mini short arena.', 'Top con mangas con volados y short con volados en capas. Colores suaves para primavera.

Se usan juntos o por separado.', 'Volados
Colores pastel
Se usan por separado'),
  (28, 'Conjunto Chaleco y Pollera Larga', 6, 5, 62900, 31000, 7, 'Exclusivo', 'S,M,L', 'Chaleco arena de botones con pollera larga blanca en capas.', 'Chaleco sastrero en tono arena y pollera larga blanca con volados en capas.

Un look elegante para el día o la noche.', 'Chaleco sastrero
Pollera en capas
Look completo'),
  (29, 'Saco Camel con Top y Short Cuero', 6, 4, 69900, 34000, 6, NULL, 'S,M,L', 'Saco camel oversize con top satinado y short de eco cuero.', 'Saco camel oversize que se usa abierto sobre un top satinado color nude y short de eco cuero negro.

Un look de noche listo para usar.', 'Saco oversize
Top satinado
Short eco cuero');

-- ── Fotos (la primera de cada producto es la principal) ─
INSERT INTO producto_imagenes (producto_id, ruta, orden) VALUES
  (1, '/img/productos/remeras/remera1a.jpg', 0),
  (1, '/img/productos/remeras/remera1b.jpg', 1),
  (2, '/img/productos/remeras/remera2a.jpg', 0),
  (2, '/img/productos/remeras/remera2b.jpg', 1),
  (3, '/img/productos/remeras/remera3a.jpg', 0),
  (3, '/img/productos/remeras/remera3b.jpg', 1),
  (4, '/img/productos/remeras/remera4.jpg', 0),
  (5, '/img/productos/remeras/remera5a.jpg', 0),
  (5, '/img/productos/remeras/remera5b.jpg', 1),
  (6, '/img/catalogo/remera-paris-negra.webp', 0),
  (6, '/img/catalogo/remera-paris-modelo.webp', 1),
  (7, '/img/catalogo/remera-paris-blanca.webp', 0),
  (7, '/img/catalogo/remera-paris-modelo.webp', 1),
  (8, '/img/productos/abrigos/abrigo1a.jpg', 0),
  (8, '/img/productos/abrigos/abrigo1b.jpg', 1),
  (9, '/img/productos/abrigos/abrigo2a.jpg', 0),
  (9, '/img/productos/abrigos/abrigo2b.jpg', 1),
  (9, '/img/productos/abrigos/abrigo2c.jpg', 2),
  (10, '/img/productos/abrigos/abrigo3a.jpg', 0),
  (10, '/img/productos/abrigos/abrigo3b.jpg', 1),
  (11, '/img/productos/abrigos/abrigo4a.jpg', 0),
  (12, '/img/productos/abrigos/abrigo4b.jpg', 0),
  (13, '/img/catalogo/tapado-camel.webp', 0),
  (14, '/img/productos/vestidos/vestido1a.jpg', 0),
  (14, '/img/productos/vestidos/vestido1b.jpg', 1),
  (15, '/img/productos/vestidos/vestido2.jpg', 0),
  (16, '/img/productos/vestidos/vestido3a.jpg', 0),
  (16, '/img/productos/vestidos/vestido3b.jpg', 1),
  (17, '/img/productos/vestidos/vestido4a.jpg', 0),
  (17, '/img/productos/vestidos/vestido4b.jpg', 1),
  (18, '/img/productos/vestidos/vestido5a.jpg', 0),
  (18, '/img/productos/vestidos/vestido5b.jpg', 1),
  (19, '/img/productos/pantalones/jean1a.jpg', 0),
  (19, '/img/productos/pantalones/jean1b.jpg', 1),
  (20, '/img/productos/pantalones/pantalon2a.jpg', 0),
  (20, '/img/productos/pantalones/pantalon2b.jpg', 1),
  (21, '/img/productos/pantalones/pantalon3a.jpg', 0),
  (22, '/img/productos/pantalones/pantalon4a.jpg', 0),
  (22, '/img/productos/pantalones/pantalon4b.jpg', 1),
  (23, '/img/productos/accesorios/aro1a.jpg', 0),
  (23, '/img/productos/accesorios/aro1b.jpg', 1),
  (24, '/img/productos/accesorios/pulsera1a.jpg', 0),
  (24, '/img/productos/accesorios/pulsera1b.jpg', 1),
  (25, '/img/productos/outifits/outfit2.jpg', 0),
  (26, '/img/productos/outifits/outfit1.jpg', 0),
  (27, '/img/productos/outifits/outfit3.jpg', 0),
  (28, '/img/productos/outifits/outfit4.jpg', 0),
  (29, '/img/productos/abrigos/outfits1a.jpg', 0);

-- ── Ficha técnica de cada producto ──────────────────────
INSERT INTO especificaciones (producto_id, clave, valor, orden) VALUES
  (1, 'Composición', '100% algodón', 1),
  (1, 'Calce', 'Relajado', 2),
  (1, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (2, 'Composición', '100% algodón', 1),
  (2, 'Calce', 'Relajado', 2),
  (2, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (3, 'Composición', 'Lino y algodón', 1),
  (3, 'Calce', 'Al cuerpo', 2),
  (3, 'Cuidado', 'Lavar a mano', 3),
  (4, 'Composición', '100% algodón', 1),
  (4, 'Calce', 'Amplio', 2),
  (4, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (5, 'Composición', 'Algodón con bordado', 1),
  (5, 'Calce', 'Relajado', 2),
  (5, 'Cuidado', 'Lavar a mano', 3),
  (6, 'Composición', '100% algodón', 1),
  (6, 'Calce', 'Amplio', 2),
  (6, 'Detalle', 'Bordado de perlas', 3),
  (6, 'Cuidado', 'Lavar del revés, agua fría', 4),
  (7, 'Composición', '100% algodón', 1),
  (7, 'Calce', 'Amplio', 2),
  (7, 'Detalle', 'Bordado de perlas', 3),
  (7, 'Cuidado', 'Lavar del revés, agua fría', 4),
  (8, 'Composición', 'Eco cuero', 1),
  (8, 'Calce', 'Oversize corto', 2),
  (8, 'Forro', 'Sí', 3),
  (8, 'Cuidado', 'Limpiar con paño húmedo', 4),
  (9, 'Composición', 'Gamuza sintética', 1),
  (9, 'Forro', 'Corderito', 2),
  (9, 'Calce', 'Oversize', 3),
  (9, 'Cuidado', 'Limpieza en seco', 4),
  (10, 'Composición', 'Eco cuero', 1),
  (10, 'Calce', 'Regular', 2),
  (10, 'Forro', 'Sí', 3),
  (10, 'Cuidado', 'Limpiar con paño húmedo', 4),
  (11, 'Composición', '100% algodón', 1),
  (11, 'Calce', 'Oversize', 2),
  (11, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (12, 'Composición', '100% algodón', 1),
  (12, 'Calce', 'Amplio', 2),
  (12, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (13, 'Composición', 'Paño (poliéster, viscosa, lana)', 1),
  (13, 'Calce', 'Recto', 2),
  (13, 'Largo', 'Debajo de la rodilla', 3),
  (13, 'Cuidado', 'Limpieza en seco', 4),
  (14, 'Composición', 'Lino y viscosa', 1),
  (14, 'Largo', 'Corto', 2),
  (14, 'Cuidado', 'Lavar a mano', 3),
  (15, 'Composición', '100% algodón', 1),
  (15, 'Largo', 'Corto', 2),
  (15, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (16, 'Composición', 'Lino y viscosa', 1),
  (16, 'Largo', 'Corto', 2),
  (16, 'Cuidado', 'Lavar a mano', 3),
  (17, 'Composición', 'Viscosa', 1),
  (17, 'Largo', 'Maxi', 2),
  (17, 'Cuidado', 'Lavar a mano', 3),
  (18, 'Composición', 'Viscosa', 1),
  (18, 'Largo', 'Maxi', 2),
  (18, 'Cuidado', 'Lavar a mano', 3),
  (19, 'Composición', '98% algodón, 2% elastano', 1),
  (19, 'Tiro', 'Alto', 2),
  (19, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (20, 'Composición', '100% algodón', 1),
  (20, 'Tiro', 'Alto', 2),
  (20, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (21, 'Composición', '100% algodón', 1),
  (21, 'Tiro', 'Alto', 2),
  (21, 'Cuidado', 'Lavar del revés, agua fría', 3),
  (22, 'Composición', 'Viscosa y lino', 1),
  (22, 'Tiro', 'Alto', 2),
  (22, 'Cuidado', 'Lavar a mano', 3),
  (23, 'Material', 'Plata 925', 1),
  (23, 'Incluye', 'Caja de regalo', 2),
  (23, 'Cuidado', 'Guardar en la caja, evitar el agua', 3),
  (24, 'Material', 'Acero con baño', 1),
  (24, 'Cuidado', 'Evitar el agua y perfumes', 2),
  (25, 'Incluye', 'Blusa + mini pollera', 1),
  (25, 'Composición', 'Algodón y viscosa', 2),
  (25, 'Cuidado', 'Lavar a mano', 3),
  (26, 'Incluye', 'Camisa + short', 1),
  (26, 'Composición', 'Algodón', 2),
  (26, 'Cuidado', 'Lavar a mano', 3),
  (27, 'Incluye', 'Top + short', 1),
  (27, 'Composición', 'Algodón y viscosa', 2),
  (27, 'Cuidado', 'Lavar a mano', 3),
  (28, 'Incluye', 'Chaleco + pollera', 1),
  (28, 'Composición', 'Lino y viscosa', 2),
  (28, 'Cuidado', 'Lavar a mano', 3),
  (29, 'Incluye', 'Saco + top + short', 1),
  (29, 'Composición', 'Mezcla', 2),
  (29, 'Cuidado', 'Limpieza en seco', 3);

-- ── Cupones ─────────────────────────────────────────────
INSERT INTO cupones (codigo, descripcion, porcentaje, activo, vence_en) VALUES
  ('BIENVENIDA', '10% off en tu primera compra', 0.1000, 1, NULL),
  ('MATILDA5', '5% off de prueba', 0.0500, 1, NULL),
  ('VERANO20', '20% off de temporada (vencido)', 0.2000, 1, CURDATE() - INTERVAL 10 DAY);

-- ── Favoritos del cliente demo ──────────────────────────
INSERT INTO favoritos (usuario_id, producto_id) VALUES
  (1, 9),
  (1, 14),
  (1, 22);

-- Dirección guardada del cliente demo (se usa para completar el checkout)
UPDATE usuarios SET dni = '30111222', calle = 'Av. Siempre Viva', altura = '2837', codigo_postal = '1405',
       ciudad = 'CABA', provincia = 'Ciudad Autónoma de Buenos Aires'
WHERE email = 'demo@tienda.com';
