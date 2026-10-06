# Matilda Boutique — tienda online de ropa

E-commerce en Node.js + Express + EJS + Sequelize (MySQL), basado en la estructura de `project1`
y adaptado a indumentaria: **talles**, categorías de moda y un diseño propio con el logo de la marca.

Estructura siempre separada: vistas en `src/views` (EJS), estilos en `public/css`, scripts en `public/js`.
Responsive (celular, tablet ≥ 768px y PC ≥ 1100px).

## Puesta en marcha

```bash
npm install
npm start                # http://localhost:3000
```

Los datos de MySQL salen del archivo `.env`. Si la base está vacía, `npm start` crea
solo las tablas y carga el catálogo (29 prendas con sus fotos de `public/img/productos`).
Para recargarlo desde cero a mano: `npm run db:instalar` (borra las tablas de la tienda).

Usuarios de prueba: ver `database/README.md` (cliente, admin y superadmin).

## Lo propio de ropa
- **Talles** por prenda (`productos.talles`, ej. `S,M,L,XL` o `36,38,40`); el cliente debe elegir uno y queda guardado en el pedido (`pedido_items.talle`). Se cargan desde Admin → Productos.
- Filtro por talle, categoría, color y precio en el catálogo (`/catalogo?categoria=Remeras`).
- Segunda foto al pasar el mouse sobre cada prenda.
- Inicio editable desde Admin → Inicio (portada, categorías, detalles, guía de talles, looks, testimonios…).

## Marca
- Logo: `public/img/marca/` (dorado y versión clara para fondos oscuros).
- Fotos de portada: `public/img/inicio/`; fotos de las prendas de prueba: `public/img/catalogo/`.
- Paleta y tipografías: variables en `:root` de `public/css/base.css`.
