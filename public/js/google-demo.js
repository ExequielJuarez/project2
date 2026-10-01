// ==========================================================
// GOOGLE (MODO DEMO) — Interacciones propias de la vista (usa base.js)
// Muestra el formulario para "usar otra cuenta".
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $ } = window.Tienda;

  const boton = $("#otraCuenta");
  const form = $("#formOtra");

  boton.addEventListener("click", () => {
    form.hidden = !form.hidden;
    boton.setAttribute("aria-expanded", String(!form.hidden));
    if (!form.hidden) $("#nombre").focus();
  });
});
