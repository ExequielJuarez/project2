-- Talles de la ropa: lista por producto y talle elegido en cada renglón de pedido.
-- (La app también lo agrega sola al arrancar; este archivo es para hacerlo a mano.)
ALTER TABLE productos
  ADD COLUMN talles VARCHAR(80) NULL COMMENT 'talles separados por coma: S,M,L,XL (NULL = talle único)' AFTER etiqueta;

ALTER TABLE pedido_items
  ADD COLUMN talle VARCHAR(12) NULL AFTER color;
