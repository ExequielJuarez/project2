// ==========================================================
// PAGO DEMO — Evita enviar dos veces el resultado simulado
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formDemo");
  form.addEventListener("submit", (e) => {
    if (form.dataset.enviado) return e.preventDefault();
    form.dataset.enviado = "1";
    // El botón elegido viaja igual; los demás quedan deshabilitados después de enviar
    setTimeout(() => form.querySelectorAll("button").forEach((b) => (b.disabled = true)), 0);
  });
});
