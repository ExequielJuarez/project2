# Matilda Boutique — tienda online de ropa

E-commerce en Node.js + Express + EJS + Sequelize (MySQL), basado en la estructura de `project1`
y adaptado a indumentaria: **talles**, categorías de moda y un diseño propio con el logo de la marca.

Estructura siempre separada: vistas en `src/views` (EJS), estilos en `public/css`, scripts en `public/js`.
Responsive (celular, tablet ≥ 768px y PC ≥ 1100px).

## Puesta en marcha

```bash
cp .env.example .env     # completar los datos de MySQL
npm install
npm run db:instalar      # crea tablas y carga prendas de prueba
npm start                # http://localhost:3000
```

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
