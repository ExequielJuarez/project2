// ==========================================================
// MIS DATOS — Cambios sin guardar, formato de DNI / código postal
// y borrar la dirección guardada (usa base.js)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$ } = window.Tienda;

  const form = $("#formDatos");
  const estado = $("#estadoDatos");
  const acciones = $("#accionesDatos");
  const serializar = () => new URLSearchParams(new FormData(form)).toString();
  const inicial = serializar();
  let enviando = false;

  function revisar() {
    const cambios = serializar() !== inicial;
    acciones.classList.toggle("con-cambios", cambios);
    estado.textContent = cambios ? "Tenés cambios sin guardar" : "";
  }

  // Solo números en DNI y código postal (también al pegar)
  [["#dni", 8], ["#codigoPostal", 4]].forEach(([sel, largo]) => {
    const campo = $(sel);
    campo?.addEventListener("input", () => {
      const limpio = campo.value.replace(/\D/g, "").slice(0, largo);
      if (limpio !== campo.value) campo.value = limpio;
    });
  });

  // Borrar la dirección guardada
  const borrar = $("#btnBorrarDireccion");
  borrar?.addEventListener("click", () => {
    ["calle", "numero", "piso", "codigoPostal", "ciudad", "provincia"].forEach((c) => {
      const campo = $(`#${c}`);
      if (campo) campo.value = "";
    });
    borrar.hidden = true;
    revisar();
    $("#btnGuardarDatos").focus();
  });

  form.addEventListener("input", revisar);
  form.addEventListener("change", revisar);
  form.addEventListener("submit", () => (enviando = true));
  window.addEventListener("beforeunload", (e) => {
    if (!enviando && serializar() !== inicial) e.preventDefault();
  });

  // Si volvió con errores, se va al resumen
  $("#resumenErrores")?.focus();
  const errorClave = $("#formClave .campo--error .campo__control");
  if (errorClave) {
    $("#clave").scrollIntoView({ block: "start" });
    errorClave.focus();
  }

  // Al abrir "Cambiar contraseña", foco en el primer campo
  $(".clave-desplegable")?.addEventListener("toggle", (e) => {
    if (e.target.open) $$("#formClave .campo__control")[0]?.focus();
  });
});
