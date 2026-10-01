// ==========================================================
// CARRITO — Interacciones propias de la vista (usa base.js)
// Cantidades, quitar/vaciar, medio de pago, envío, cupón
// y actualización de totales sin recargar la página.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, api, mostrarToast, actualizarContador } = window.Tienda;

  const carrito = $("#carrito");
  const barraTotal = $("#barraTotal");

  const formatoPrecio = (n) =>
    "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ---------- Pintar totales con la respuesta del servidor ----------
  function pintar({ cantidad, resumen: r }) {
    actualizarContador(cantidad);
    $("#cantidadTitulo").textContent = cantidad;

    // Items: cantidades y totales por línea
    r.items.forEach((i) => {
      const fila = $(`.item[data-clave="${CSS.escape(i.clave)}"]`);
      if (!fila) return;
      $("input", fila).value = i.cantidad;
      $("[data-total]", fila).textContent = formatoPrecio(i.subtotal);
    });

    // Filas de descuento que se muestran solo si aplican
    $('[data-fila="descuentoCupon"]').hidden = !r.descuentoCupon;
    $('[data-fila="descuentoPago"]').hidden = !r.descuentoPago;

    $$('[data-valor="subtotal"]').forEach((el) => (el.textContent = formatoPrecio(r.subtotal)));
    $$('[data-valor="descuentoCupon"]').forEach((el) => (el.textContent = "-" + formatoPrecio(r.descuentoCupon)));
    $$('[data-valor="descuentoPago"]').forEach((el) => (el.textContent = "-" + formatoPrecio(r.descuentoPago)));
    $$('[data-valor="total"]').forEach((el) => (el.textContent = formatoPrecio(r.total)));
    $$('[data-valor="cuota"]').forEach((el) => (el.textContent = formatoPrecio(r.total / r.cuotas)));
    $("#totalCuotas").hidden = r.medioPago !== "tarjeta";

    const envio = $('[data-valor="envio"]');
    if (r.envio === null) envio.innerHTML = '<span class="totales__pendiente">A calcular</span>';
    else envio.textContent = r.envio === 0 ? "Gratis" : formatoPrecio(r.envio);

    // Barra de envío gratis
    $("#envioGratis").classList.toggle("completo", r.envioGratis);
    $("#envioGratisBarra").style.width = `${r.progresoEnvio}%`;
    $("#envioGratisTexto").innerHTML = r.envioGratis
      ? "<strong>¡Tenés envío gratis!</strong>"
      : `Te faltan <strong>${formatoPrecio(r.faltaEnvioGratis)}</strong> para el envío gratis`;

    // Cupón
    $("#cuponFila").hidden = Boolean(r.cupon);
    $("#cuponActivo").hidden = !r.cupon;
    if (r.cupon) {
      $("#cuponCodigo").textContent = r.cupon.codigo;
      $("#cuponDescripcion").textContent = r.cupon.descripcion;
    }

    // Carrito vacío
    const vacio = r.items.length === 0;
    carrito.classList.toggle("carrito--vacio", vacio);
    actualizarBarra();
  }

  async function pedir(url, metodo, datos, fila = null) {
    if (fila) fila.classList.add("cargando");
    try {
      const r = await api(url, metodo, datos);
      pintar(r);
      return r;
    } catch (error) {
      mostrarToast(error.message);
    } finally {
      if (fila) fila.classList.remove("cargando");
    }
  }

  // ---------- Items ----------
  $$(".item").forEach((fila) => {
    const clave = encodeURIComponent(fila.dataset.clave);
    const input = $("input", fila);
    const stock = Number(fila.dataset.stock) || 99;
    let espera;

    const cambiarCantidad = (valor) => {
      const cantidad = Math.min(Math.max(1, valor || 1), stock);
      input.value = cantidad;
      // Espera un momento por si el usuario toca varias veces seguidas
      clearTimeout(espera);
      espera = setTimeout(() => pedir(`/carrito/item/${clave}`, "PATCH", { cantidad }, fila), 300);
    };

    $$("[data-paso]", fila).forEach((btn) =>
      btn.addEventListener("click", () => cambiarCantidad(Number(input.value) + Number(btn.dataset.paso)))
    );
    input.addEventListener("change", () => cambiarCantidad(Number(input.value)));

    $(".item__quitar", fila).addEventListener("click", async () => {
      fila.classList.add("saliendo");
      const r = await pedir(`/carrito/item/${clave}`, "DELETE");
      if (r) {
        setTimeout(() => fila.remove(), 300);
        mostrarToast("Producto quitado del carrito");
      } else {
        fila.classList.remove("saliendo");
      }
    });
  });

  $("#btnVaciar").addEventListener("click", async () => {
    if (!confirm("¿Querés vaciar el carrito?")) return;
    const r = await pedir("/carrito", "DELETE");
    if (r) $$(".item").forEach((f) => f.remove());
  });

  // ---------- Medio de pago ----------
  $$('input[name="medioPago"]').forEach((radio) =>
    radio.addEventListener("change", () => pedir("/carrito/medio-pago", "POST", { medio: radio.value }))
  );

  // ---------- Envío ----------
  $("#formEnvio").addEventListener("submit", async (e) => {
    e.preventDefault();
    const r = await pedir("/carrito/envio", "POST", { codigoPostal: $("#codigoPostal").value.trim() });
    if (r) mostrarToast("Envío calculado");
  });

  // ---------- Cupón ----------
  $("#formCupon").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = $("#codigoCupon");
    const r = await pedir("/carrito/cupon", "POST", { codigo: input.value });
    if (r) {
      input.value = "";
      mostrarToast("Cupón aplicado");
    }
  });

  $("#btnQuitarCupon").addEventListener("click", () => pedir("/carrito/cupon", "DELETE"));

  // ---------- Barra fija con el total ----------
  // Se oculta cuando el resumen ya está en pantalla o el carrito está vacío
  let resumenVisible = false;

  function actualizarBarra() {
    const ocultar = resumenVisible || carrito.classList.contains("carrito--vacio");
    barraTotal.classList.toggle("oculta", ocultar);
    document.body.classList.toggle("con-barra", !ocultar);
  }

  new IntersectionObserver(([entrada]) => {
    resumenVisible = entrada.isIntersecting;
    actualizarBarra();
  }).observe($("#btnFinalizar"));

  actualizarBarra();
});
