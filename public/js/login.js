// ==========================================================
// LOGIN — Interacciones propias de la vista (usa base.js)
// Validación antes de enviar y usuario de prueba.
// (Mostrar contraseña y aviso de mayúsculas están en base.js)
// El servidor vuelve a validar todo al enviar.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $ } = window.Tienda;

  // Si el foco va al botón de enviar no validamos en el blur: el mensaje de error
  // correría el botón y el clic se perdería. El submit valida todo igual.
  const vaAEnviar = (e) => e.relatedTarget?.type === "submit";

  const form = $("#formLogin");
  const email = $("#email");
  const password = $("#password");

  // ---------- Validación antes de enviar ----------
  const reglas = [
    [email, (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Ingresá un email válido"],
    [password, (v) => v.length > 0, "Ingresá tu contraseña"],
  ];

  function validar([input, esValido, mensaje]) {
    const ok = esValido(input.value.trim());
    const campo = input.closest(".campo");
    campo.classList.toggle("campo--error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    $(".campo__error", campo).textContent = ok ? "" : mensaje;
    return ok;
  }

  reglas.forEach((regla) => {
    const [input] = regla;
    input.addEventListener("blur", (e) => input.value && !vaAEnviar(e) && validar(regla));
    input.addEventListener("input", () => {
      if (input.closest(".campo").classList.contains("campo--error")) validar(regla);
    });
  });

  form.addEventListener("submit", (e) => {
    const conError = reglas.filter((regla) => !validar(regla));
    if (conError.length) {
      e.preventDefault();
      conError[0][0].focus();
      return;
    }
    const boton = $("#btnIngresar");
    boton.disabled = true;
    boton.textContent = "Ingresando…";
  });

  // Si el servidor rechazó el ingreso, dejar el foco listo en la contraseña
  if ($(".aviso--error") && email.value) password.focus();

  // ---------- Usuarios de prueba (solo maqueta) ----------
  document.querySelectorAll("[data-demo-email]").forEach((boton) =>
    boton.addEventListener("click", () => {
      email.value = boton.dataset.demoEmail;
      password.value = boton.dataset.demoClave;
      reglas.forEach(validar);
      $("#btnIngresar").focus();
    })
  );
});
