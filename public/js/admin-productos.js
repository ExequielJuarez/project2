// ==========================================================
// ADMIN · PRODUCTOS — Interacciones propias de la vista (usa admin.js)
// Filtros que se aplican solos y ajuste rápido de stock
// (se guarda en el servidor sin recargar la página).
// El borrado usa el modal de confirmación de admin.js.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, api, mostrarToast } = window.Admin;

  // ---------- Filtros: se envían solos ----------
  const filtros = $("#filtrosProductos");
  let espera;
  $$("select", filtros).forEach((s) => s.addEventListener("change", () => filtros.submit()));
  $('input[name="q"]', filtros).addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(() => filtros.submit(), 450);
  });
  // Al recargar, dejar el cursor al final de la búsqueda
  const buscar = $('input[name="q"]', filtros);
  if (buscar.value) {
    buscar.focus();
    buscar.setSelectionRange(buscar.value.length, buscar.value.length);
  }

  // ---------- Stock ----------
  const compacto = (n) =>
    n >= 1e6 ? `$${(n / 1e6).toLocaleString("es-AR", { maximumFractionDigits: 1 })} M` : `$${Math.round(n / 1e3)} mil`;

  function pintarEtiqueta(fila, stock, stockBajo) {
    const tag = $("[data-stock-tag]", fila);
    const [clase, texto] = stock === 0 ? ["sin", "Sin stock"] : stock <= stockBajo ? ["bajo", "Bajo"] : ["ok", "OK"];
    tag.className = `stock-tag stock-tag--${clase}`;
    tag.textContent = texto;
  }

  async function guardarStock(control, datos) {
    const fila = control.closest("tr");
    const input = $("input", control);
    control.classList.add("guardando");
    try {
      const r = await api(`/admin/productos/${control.dataset.stockId}/stock`, "PATCH", datos);
      input.value = r.stock;
      input.dataset.anterior = r.stock;
      pintarEtiqueta(fila, r.stock, r.stockBajo);
      $("#unidadesTotales").textContent = r.resumen.unidades;
      $("#valorStock").textContent = compacto(r.resumen.valorCosto);
    } catch (error) {
      input.value = input.dataset.anterior;
      mostrarToast(error.message);
    } finally {
      control.classList.remove("guardando");
    }
  }

  $$(".stock-ajuste").forEach((control) => {
    const input = $("input", control);
    input.dataset.anterior = input.value;

    $$("[data-cambio]", control).forEach((btn) =>
      btn.addEventListener("click", () => {
        if (Number(input.value) + Number(btn.dataset.cambio) < 0) return;
        input.value = Number(input.value) + Number(btn.dataset.cambio);
        guardarStock(control, { cambio: btn.dataset.cambio });
      })
    );

    // Escribir el número y salir del campo (o Enter) guarda el valor exacto
    input.addEventListener("change", () => guardarStock(control, { valor: input.value }));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      }
    });
  });
});
