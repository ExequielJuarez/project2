// ==========================================================
// REGISTRO — Interacciones propias de la vista (usa base.js)
// Medidor de seguridad de la contraseña, requisitos que se
// tildan en vivo y validación antes de enviar.
// El servidor vuelve a validar todo al enviar.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$ } = window.Tienda;

  // Si el foco va al botón de enviar no validamos en el blur: el mensaje de error
  // correría el botón y el clic se perdería. El submit valida todo igual.
  const vaAEnviar = (e) => e.relatedTarget?.type === "submit";

  const form = $("#formRegistro");
  const password = $("#password");
  const confirmar = $("#confirmar");

  // ---------- Seguridad de la contraseña ----------
  const fuerza = $(".fuerza");
  const fuerzaTexto = $("#fuerzaTexto");
  const niveles = ["Seguridad de la contraseña", "Débil", "Aceptable", "Buena", "Muy buena"];

  const requisitos = {
    largo: (v) => v.length >= 8,
    letra: (v) => /[A-Za-z]/.test(v),
    numero: (v) => /\d/.test(v),
  };

  function medir(valor) {
    if (!valor) return 0;
    let puntos = 0;
    if (valor.length >= 8) puntos++;
    if (valor.length >= 12) puntos++;
    if (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) puntos++;
    if (/\d/.test(valor)) puntos++;
    if (/[^A-Za-z0-9]/.test(valor)) puntos++;
    return Math.max(1, Math.min(4, puntos));
  }

  password.addEventListener("input", () => {
    const valor = password.value;
    const nivel = medir(valor);
    fuerza.dataset.nivel = nivel;
    fuerzaTexto.textContent = niveles[nivel];

    $$("[data-requisito]").forEach((li) =>
      li.classList.toggle("cumplido", requisitos[li.dataset.requisito](valor))
    );
    if (confirmar.value) validar(confirmar);
  });

  // ---------- Validación ----------
  // Mismas reglas que el servidor (src/validations/registroValidator.js)
  const reglas = {
    nombre: [(v) => v.trim().length >= 2, "Ingresá tu nombre"],
    apellido: [(v) => v.trim().length >= 2, "Ingresá tu apellido"],
    email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), "Ingresá un email válido"],
    telefono: [(v) => !v.trim() || /^[0-9+\s()-]{8,20}$/.test(v.trim()), "Ingresá un teléfono válido (con código de área)"],
    password: [(v) => Object.values(requisitos).every((r) => r(v)), "La contraseña no cumple los requisitos"],
    confirmar: [(v) => v.length > 0 && v === password.value, "Las contraseñas no coinciden"],
    terminos: [(_, input) => input.checked, "Tenés que aceptar los términos y condiciones"],
  };

  function validar(input) {
    const [esValido, mensaje] = reglas[input.name];
    const ok = esValido(input.value, input);
    const campo = input.closest(".campo");
    campo.classList.toggle("campo--error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    $(".campo__error", campo).textContent = ok ? "" : mensaje;
    return ok;
  }

  const inputs = Object.keys(reglas).map((nombre) => form.elements[nombre]);

  inputs.forEach((input) => {
    input.addEventListener("blur", (e) => input.value && input.type !== "checkbox" && !vaAEnviar(e) && validar(input));
    input.addEventListener("input", () => {
      if (input.closest(".campo").classList.contains("campo--error")) validar(input);
    });
    if (input.type === "checkbox") input.addEventListener("change", () => validar(input));
  });

  form.addEventListener("submit", (e) => {
    const conError = inputs.filter((input) => !validar(input));
    if (conError.length) {
      e.preventDefault();
      conError[0].focus();
      conError[0].closest(".campo").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const boton = $("#btnCrear");
    boton.disabled = true;
    boton.textContent = "Creando cuenta…";
  });

  // Si el servidor devolvió errores, llevar la atención al resumen
  const resumenErrores = $("#resumenErrores");
  if (resumenErrores) resumenErrores.focus();
});
