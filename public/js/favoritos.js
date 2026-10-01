// ==========================================================
// FAVORITOS — Interacciones propias de la vista (usa base.js)
// Quitar un favorito saca la tarjeta de la lista, "Agregar todo
// al carrito" y "Vaciar lista" funcionan sin recargar.
// (El corazón de cada tarjeta lo maneja base.js)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, api, mostrarToast, actualizarContador, actualizarFavoritos } = window.Tienda;

  const contenedor = $("#favoritos");
  const grilla = $("#grillaFavoritos");

  function actualizarCantidad(cantidad) {
    $("#cantidadTitulo").textContent = cantidad;
    const resumen = $("#resumenCantidad");
    if (resumen) resumen.textContent = cantidad;
    if (cantidad === 0) {
      contenedor.classList.add("favoritos--vacio");
      $("#accionesFavoritos").hidden = true;
      $("#avisoInvitado")?.remove();
    }
  }

  // Cuando base.js quita un favorito, sacamos su tarjeta de esta lista
  document.addEventListener("favoritos:cambio", ({ detail }) => {
    if (detail.activo) return;
    const tarjeta = $(`.tarjeta[data-id="${detail.id}"]`, grilla);
    if (!tarjeta) return;
    tarjeta.classList.add("saliendo");
    setTimeout(() => tarjeta.remove(), 300);
    actualizarCantidad(detail.cantidad);
  });

  // ---------- Agregar todo al carrito ----------
  const botonTodos = $("#btnTodosAlCarrito");
  botonTodos.addEventListener("click", async () => {
    botonTodos.disabled = true;
    try {
      const r = await api("/favoritos/al-carrito", "POST");
      actualizarContador(r.cantidadCarrito);
      const extra = r.sinStock ? ` (${r.sinStock} sin stock)` : "";
      mostrarToast(`Agregaste ${r.agregados} ${r.agregados === 1 ? "producto" : "productos"} al carrito${extra}`, {
        texto: "Ver carrito",
        href: "/carrito",
      });
    } catch (error) {
      mostrarToast(error.message);
    } finally {
      botonTodos.disabled = false;
    }
  });

  // ---------- Vaciar lista ----------
  $("#btnVaciarFavoritos").addEventListener("click", async () => {
    if (!confirm("¿Querés vaciar tu lista de favoritos?")) return;
    try {
      await api("/favoritos", "DELETE");
      const tarjetas = $$(".tarjeta", grilla);
      tarjetas.forEach((t) => t.classList.add("saliendo"));
      setTimeout(() => tarjetas.forEach((t) => t.remove()), 300);
      $$("[data-fav-id]").forEach((b) => actualizarFavoritos(b.dataset.favId, false, 0));
      actualizarCantidad(0);
      mostrarToast("Lista vaciada");
    } catch (error) {
      mostrarToast(error.message);
    }
  });
});
