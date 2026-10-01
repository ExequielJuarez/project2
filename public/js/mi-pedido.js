// ==========================================================
// DETALLE DEL PEDIDO — Copiar datos de la transferencia,
// confirmar la cancelación y evitar el doble clic al pagar (usa base.js)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, mostrarToast } = window.Tienda;

  // ---------- Copiar alias / CBU / monto ----------
  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Navegadores sin permiso para el portapapeles
      const campo = document.createElement("textarea");
      campo.value = texto;
      campo.setAttribute("readonly", "");
      campo.style.position = "fixed";
      campo.style.opacity = "0";
      document.body.append(campo);
      campo.select();
      const ok = document.execCommand("copy");
      campo.remove();
      return ok;
    }
  }

  $$("[data-copiar]").forEach((boton) =>
    boton.addEventListener("click", async () => {
      const valor = boton.parentElement.querySelector("[data-copiar-valor]").dataset.copiarValor;
      if (await copiar(valor)) {
        boton.textContent = "¡Copiado!";
        boton.classList.add("copiado");
        mostrarToast(`Copiado: ${valor}`);
        setTimeout(() => {
          boton.textContent = "Copiar";
          boton.classList.remove("copiado");
        }, 2000);
      } else {
        mostrarToast("No se pudo copiar, seleccionalo a mano");
      }
    })
  );

  // ---------- Cancelar (con confirmación) ----------
  const form = $("#formCancelar");
  const dialogo = $("#confirmarCancelar");
  if (form && dialogo) {
    const cerrar = () => {
      dialogo.hidden = true;
      document.body.classList.remove("bloqueado");
      $(".ficha__cancelar", form).focus();
    };
    form.addEventListener("submit", (e) => {
      if (form.dataset.confirmado) return;
      e.preventDefault();
      dialogo.hidden = false;
      document.body.classList.add("bloqueado");
      $("[data-cerrar]", dialogo).focus();
    });
    $("[data-cerrar]", dialogo).addEventListener("click", cerrar);
    dialogo.addEventListener("click", (e) => e.target === dialogo && cerrar());
    document.addEventListener("keydown", (e) => e.key === "Escape" && !dialogo.hidden && cerrar());
    $("[data-aceptar]", dialogo).addEventListener("click", () => {
      form.dataset.confirmado = "1";
      form.requestSubmit();
    });
  }

  // ---------- Pagar: evita el doble clic ----------
  const pagar = $("[data-pagar]");
  pagar?.form.addEventListener("submit", () => {
    pagar.disabled = true;
    pagar.textContent = "Te llevamos a Mercado Pago…";
  });
});
