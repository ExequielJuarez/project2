// ==========================================================
// CHECKOUT · PAGO — Elegir medio de pago y confirmar (usa base.js)
// Al cambiar el medio se recalculan los totales (la transferencia
// tiene descuento) y cambia el texto del botón.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, api, mostrarToast } = window.Tienda;

  const formatoPrecio = (n) =>
    "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ---------- Resumen desplegable (celular) ----------
  const pedido = $("#pedido");
  const toggle = $("#pedidoToggle");
  toggle.addEventListener("click", () => {
    const abierto = pedido.classList.toggle("abierto");
    toggle.setAttribute("aria-expanded", String(abierto));
  });

  // ---------- Medio de pago ----------
  const form = $("#formPago");
  const boton = $("#btnPagar");
  const textoBoton = $("#btnPagarTexto");

  function pintar(r) {
    $$('[data-valor="total"]').forEach((el) => (el.textContent = formatoPrecio(r.total)));
    $('[data-valor="descuentoPago"]').textContent = `-${formatoPrecio(r.descuentoPago)}`;
    $('[data-fila="descuentoPago"]').hidden = !r.descuentoPago;
    const texto = $("[data-texto-pago]");
    if (texto) texto.textContent = r.medioPago === "transferencia" ? "transferencia" : `tarjeta en ${r.cuotas} cuotas sin interés`;
    textoBoton.textContent = r.medioPago === "transferencia" ? boton.dataset.textoTransferencia : boton.dataset.textoTarjeta;
  }

  $$('input[name="medio"]').forEach((radio) =>
    radio.addEventListener("change", async () => {
      boton.disabled = true;
      try {
        const r = await api("/carrito/medio-pago", "POST", { medio: radio.value });
        pintar(r.resumen);
      } catch (error) {
        mostrarToast(error.message);
      } finally {
        boton.disabled = false;
      }
    })
  );

  // ---------- Confirmar (evita el doble clic) ----------
  form.addEventListener("submit", (e) => {
    if (form.dataset.enviado) return e.preventDefault();
    form.dataset.enviado = "1";
    boton.disabled = true;
    const tarjeta = $('input[name="medio"]:checked').value === "tarjeta";
    textoBoton.textContent = tarjeta ? "Te llevamos a Mercado Pago…" : "Confirmando…";
  });

  // Si vuelve con el botón "atrás" del navegador, el botón se reactiva
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    delete form.dataset.enviado;
    boton.disabled = false;
  });
});
