// Roles de los usuarios:
//   cliente    → compra en la tienda
//   admin      → panel de administración (el dueño de la tienda)
//   superadmin → todo lo del admin + editor de la página de inicio (quien mantiene el sitio)
const ROLES = ["cliente", "admin", "superadmin"];

const esAdmin = (u) => Boolean(u) && (u.rol === "admin" || u.rol === "superadmin");
const esSuperAdmin = (u) => Boolean(u) && u.rol === "superadmin";

module.exports = { ROLES, esAdmin, esSuperAdmin };
