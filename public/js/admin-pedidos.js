// ==========================================================
// ADMIN · PEDIDOS — Interacciones propias de la vista (usa admin.js)
// Búsqueda que se aplica sola y cambio de estado de un pedido
// sin recargar la página (cancelar devuelve el stock).
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, api, mostrarToast, confirmar } = window.Admin;

  // ---------- Búsqueda ----------
  const form = $("#filtrosPedidos");
  const buscar = $('input[name="q"]', form);
  let espera;
  buscar.addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(() => form.submit(), 450);
  });
  if (buscar.value) {
    buscar.focus();
    buscar.setSelectionRange(buscar.value.length, buscar.value.length);
  }

  // ---------- Cambiar estado ----------
  // Cancelar devuelve el stock y saca la venta de las estadísticas;
  // reactivar un cancelado vuelve a descontar el stock. Ambos piden confirmación.
  const compacto = (n) =>
    n >= 1e6 ? `$${(n / 1e6).toLocaleString("es-AR", { maximumFractionDigits: 1 })} M` : `$${Math.round(n / 1e3)} mil`;
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

  function sumarConteo(estado, cambio) {
    const el = $(`[data-conteo="${estado}"]`);
    if (el) el.textContent = Number(el.textContent) + cambio;
  }

  $$("[data-cambiar-estado]").forEach((select) => {
    let anterior = select.value;

    select.addEventListener("change", async () => {
      const fila = select.closest(".pedido-fila");
      const numero = fila.dataset.numero;
      const nuevo = select.value;
      const unidades = Number(fila.dataset.unidades);

      if (nuevo === "cancelado" || anterior === "cancelado") {
        const cancela = nuevo === "cancelado";
        const ok = await confirmar({
          titulo: cancela ? `¿Cancelar el pedido #${numero}?` : `¿Reactivar el pedido #${numero}?`,
          texto: cancela
            ? `Se devuelven ${plural(unidades, "unidad", "unidades")} al stock y la venta deja de contar en las estadísticas.`
            : `Se vuelven a descontar ${plural(unidades, "unidad", "unidades")} del stock y la venta vuelve a contar en las estadísticas.`,
          boton: cancela ? "Cancelar pedido" : "Reactivar",
        });
        if (!ok) {
          select.value = anterior;
          return;
        }
      }

      fila.classList.add("guardando");
      try {
        const r = await api(`/admin/pedidos/${numero}/estado`, "PATCH", { estado: nuevo });
        $("[data-confirmar-transferencia]", fila)?.remove();
        const tag = $("[data-estado-tag]", fila);
        tag.className = `pedido-fila__estado estado estado--${r.estado}`;
        tag.textContent = select.options[select.selectedIndex].text;
        // Marcar como pagado también registra el cobro (por ejemplo, una transferencia)
        const NOMBRES_PAGO = { pendiente: "pago pendiente", aprobado: "pago aprobado", rechazado: "pago rechazado", reembolsado: "reembolsado" };
        const cobro = $("[data-cobro]", fila);
        cobro.className = `cobro cobro--${r.pagoEstado}`;
        cobro.textContent = NOMBRES_PAGO[r.pagoEstado];
        $("[data-cobro-texto]", fila).textContent = NOMBRES_PAGO[r.pagoEstado];
        $("[data-ganancia-texto]", fila).textContent =
          r.estado === "cancelado" ? "cancelado · no suma" : `ganancia ${compacto(r.ganancia)}`;

        // Contadores de las pestañas, del encabezado y del menú lateral
        sumarConteo(anterior, -1);
        sumarConteo(r.estado, +1);
        $("[data-pendientes]").textContent = r.pendientes;
        const badge = $('[data-badge="pedidos"]');
        if (badge) {
          badge.textContent = r.pendientes;
          badge.classList.toggle("admin-nav__badge--fuerte", r.pendientes > 0);
        }

        let detalle = "";
        if (r.stockMovido > 0) detalle = ` · se ${r.stockMovido === 1 ? "devolvió 1 unidad" : `devolvieron ${r.stockMovido} unidades`} al stock`;
        if (r.stockMovido < 0) detalle = ` · se ${r.stockMovido === -1 ? "descontó 1 unidad" : `descontaron ${-r.stockMovido} unidades`} del stock`;
        mostrarToast(`Pedido #${numero}: ${tag.textContent.toLowerCase()}${detalle}`);
        anterior = r.estado;
      } catch (error) {
        select.value = anterior;
        mostrarToast(error.message);
      } finally {
        fila.classList.remove("guardando");
      }
    });
  });
  // ---------- Confirmar transferencia ----------
  // Atajo para marcar como pagada una transferencia que ya se acreditó:
  // el cliente recién ahí ve su pedido como pagado
  $$("[data-confirmar-transferencia]").forEach((boton) =>
    boton.addEventListener("click", async () => {
      const fila = boton.closest(".pedido-fila");
      const ok = await confirmar({
        titulo: `¿Confirmás la transferencia del pedido #${fila.dataset.numero}?`,
        texto: `Hacelo cuando veas acreditados ${boton.dataset.total} en tu cuenta. El cliente va a ver el pedido como pagado.`,
        boton: "Sí, se acreditó",
      });
      if (!ok) return;
      const select = $("[data-cambiar-estado]", fila);
      select.value = "pagado";
      select.dispatchEvent(new Event("change"));
    })
  );
});
