// ==========================================================
// CHECKOUT · DATOS — Interacciones propias de la vista (usa base.js)
// Resumen desplegable, opciones de entrega y factura,
// validación en vivo y actualización del costo de envío.
// El servidor vuelve a validar todo al enviar.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, api, mostrarToast } = window.Tienda;

  // Si el foco va al botón de enviar no validamos en el blur: el mensaje de error
  // correría el botón y el clic se perdería. El submit valida todo igual.
  const vaAEnviar = (e) => e.relatedTarget?.type === "submit";

  const form = $("#formDatos");

  const formatoPrecio = (n) =>
    "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ---------- Resumen desplegable (celular / tablet) ----------
  const pedido = $("#pedido");
  const toggle = $("#pedidoToggle");
  toggle.addEventListener("click", () => {
    const abierto = pedido.classList.toggle("abierto");
    toggle.setAttribute("aria-expanded", String(abierto));
  });

  // ---------- Totales del resumen ----------
  function pintarTotales({ resumen: r }) {
    const envio = r.envio === null ? "A calcular" : r.envio === 0 ? "Gratis" : formatoPrecio(r.envio);
    $$('[data-valor="envio"]').forEach((el) => (el.textContent = envio));
    $$('[data-valor="total"]').forEach((el) => (el.textContent = formatoPrecio(r.total)));
  }

  async function actualizarEnvio(url, datos) {
    try {
      pintarTotales(await api(url, "POST", datos));
    } catch (error) {
      mostrarToast(error.message);
    }
  }

  // ---------- Entrega: domicilio o retiro ----------
  const grupoDomicilio = $("#grupoDomicilio");
  const grupoRetiro = $("#grupoRetiro");

  $$('input[name="entrega"]').forEach((radio) =>
    radio.addEventListener("change", () => {
      const retiro = radio.value === "retiro";
      grupoDomicilio.hidden = retiro;
      grupoRetiro.hidden = !retiro;
      actualizarEnvio("/carrito/entrega", { entrega: radio.value });
    })
  );

  // Con el código postal completo se calcula el envío
  const inputCP = $("#codigoPostal");
  inputCP.addEventListener("input", () => {
    inputCP.value = inputCP.value.replace(/\D/g, "");
    if (/^\d{4}$/.test(inputCP.value)) actualizarEnvio("/carrito/envio", { codigoPostal: inputCP.value });
  });

  // ---------- Facturación ----------
  const grupoFacturaA = $("#grupoFacturaA");
  $$('input[name="facturacion"]').forEach((radio) =>
    radio.addEventListener("change", () => (grupoFacturaA.hidden = radio.value !== "facturaA"))
  );

  // ---------- Formatos mientras se escribe ----------
  const inputDNI = $("#dni");
  // Sin maxlength en el HTML para que al pegar "30.111.222" no se corte antes de quitar los puntos
  inputDNI.addEventListener("input", () => (inputDNI.value = inputDNI.value.replace(/\D/g, "").slice(0, 8)));

  const inputCUIT = $("#cuit");
  inputCUIT.addEventListener("input", () => {
    const n = inputCUIT.value.replace(/\D/g, "").slice(0, 11);
    inputCUIT.value = [n.slice(0, 2), n.slice(2, 10), n.slice(10)].filter(Boolean).join("-");
  });

  // ---------- Validación en vivo ----------
  // Mismas reglas que el servidor (src/validations/checkoutValidator.js)
  const reglas = {
    email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Ingresá un email válido"],
    nombre: [(v) => v.length >= 2, "Ingresá tu nombre"],
    apellido: [(v) => v.length >= 2, "Ingresá tu apellido"],
    telefono: [(v) => /^[0-9+\s()-]{8,20}$/.test(v), "Ingresá un teléfono válido (con código de área)"],
    dni: [(v) => /^\d{7,8}$/.test(v), "El DNI debe tener 7 u 8 números, sin puntos"],
    calle: [(v) => v.length > 0, "Ingresá la calle"],
    numero: [(v) => /^(\d{1,6}|S\/N)$/i.test(v), "Ingresá la altura (o S/N)"],
    codigoPostal: [(v) => /^\d{4}$/.test(v), "El código postal tiene 4 números"],
    ciudad: [(v) => v.length > 0, "Ingresá la ciudad o localidad"],
    provincia: [(v) => v.length > 0, "Elegí una provincia"],
    cuit: [(v) => /^\d{2}-?\d{8}-?\d$/.test(v), "Ingresá un CUIT válido (11 números)"],
    razonSocial: [(v) => v.length > 0, "Ingresá la razón social"],
  };

  // Un campo se valida solo si está visible (no dentro de un grupo oculto)
  const estaVisible = (input) => !input.closest("[hidden]");

  function validar(input) {
    const regla = reglas[input.name];
    if (!regla || !estaVisible(input)) return true;

    const [esValido, mensaje] = regla;
    const ok = esValido(input.value.trim());
    const campo = input.closest(".campo");

    campo.classList.toggle("campo--error", !ok);
    campo.classList.toggle("campo--ok", ok);
    input.setAttribute("aria-invalid", String(!ok));
    $(".campo__error", campo).textContent = ok ? "" : mensaje;
    return ok;
  }

  const inputs = Object.keys(reglas).map((nombre) => form.elements[nombre]).filter(Boolean);

  inputs.forEach((input) => {
    // Primero valida al salir del campo; si ya tenía error, se corrige mientras escribe
    input.addEventListener("blur", (e) => input.value && !vaAEnviar(e) && validar(input));
    input.addEventListener("input", () => {
      if (input.closest(".campo").classList.contains("campo--error")) validar(input);
    });
    input.addEventListener("change", () => input.tagName === "SELECT" && validar(input));
  });

  form.addEventListener("submit", (e) => {
    const conError = inputs.filter((input) => !validar(input));

    if (conError.length) {
      e.preventDefault();
      conError[0].focus();
      conError[0].closest(".campo").scrollIntoView({ behavior: "smooth", block: "center" });
      mostrarToast(
        conError.length === 1 ? "Revisá el campo marcado" : `Revisá los ${conError.length} campos marcados`
      );
      return;
    }

    const boton = $("#btnContinuar");
    boton.disabled = true;
    boton.textContent = "Guardando…";
  });

  // Si el servidor devolvió errores, llevar la atención al resumen de errores
  const resumenErrores = $("#resumenErrores");
  if (resumenErrores) resumenErrores.focus();
});
