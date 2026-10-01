# Publicar en Render

## 1. Base de datos (una sola vez)

Con tu `.env` apuntando a la base de Clever Cloud (`DB_HOST`, `DB_USER`, `DB_PASSWORD`,
`DB_NAME` de Clever Cloud y `DB_POOL_MAX=3`), en tu computadora:

```bash
npm run db:instalar
```

Crea las tablas y carga los datos de prueba. **Borra lo que hubiera en esa base.**
Para dejarla sin datos de prueba: `npm run db:instalar -- --vacia` (en ese caso creá los
usuarios admin y superadmin registrándote y después cambiales el rol, ver abajo).

## 2. Servicio en Render

New → **Web Service** → elegí el repositorio y la rama `deploy`.

| Campo | Valor |
|---|---|
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

## 3. Variables de entorno

En el servicio → **Environment** → **Add from .env**, pegá tu `.env` con estos cambios:

```
NODE_ENV=production
SESSION_SECRET=una-frase-larga-y-secreta-que-nadie-conozca
APP_URL=https://TU-APP.onrender.com
DB_POOL_MAX=3
```

- **No subas el `.env` al repositorio**: Render usa estas variables.
- `NODE_ENV=production` oculta los usuarios de prueba del login y desactiva los modos demo
  (Google y pago simulado). Sin `MP_ACCESS_TOKEN`, la tienda solo ofrece transferencia.
- `PORT` no hace falta: Render lo pone solo.

## 4. Usuarios y roles

| Rol | Qué puede hacer |
|---|---|
| `cliente` | Comprar, Mis pedidos, Mis datos |
| `admin` | Panel completo: productos, pedidos, estadísticas (el dueño de la tienda) |
| `superadmin` | Todo lo del admin + **editor de la página de inicio** |

Los datos de prueba traen `admin@tienda.com / Admin1234` y `super@tienda.com / Super1234`.
**Cambiales la contraseña** (Mi cuenta → Mis datos) antes de mostrar la tienda.

Para darle un rol a una cuenta, en la base (Workbench o la consola de Clever Cloud):

```sql
UPDATE usuarios SET rol = 'superadmin' WHERE email = 'tu-email@ejemplo.com';
UPDATE usuarios SET rol = 'admin'      WHERE email = 'email-del-cliente@ejemplo.com';
```

(Después de cambiar un rol, esa persona tiene que cerrar sesión y volver a entrar.)

## 5. Tener en cuenta

- **Las fotos subidas desde el panel se pierden** cuando Render reinicia o vuelve a publicar
  el servicio: su disco no es permanente. Para una tienda real hay que guardarlas en un
  servicio de imágenes (por ejemplo Cloudinary) o usar un disco persistente de Render.
- En el plan gratis, Render "duerme" el servicio si nadie entra por 15 minutos: la primera
  visita tarda unos segundos y se pierden los carritos abiertos.
- La base gratis de Clever Cloud acepta 5 conexiones en total: si la app está corriendo en
  Render y también en tu computadora contra la misma base, usá `DB_POOL_MAX=2` en cada una.
- Mercado Pago: ver `PAGOS.md` (webhook y credenciales de producción).
