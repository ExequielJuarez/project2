// ==========================================================
// INICIO — Animaciones y detalles de la presentación (usa base.js)
// Aparición al hacer scroll, contadores, parallax de la portada,
// detalles con imagen fija y testimonios.
// ==========================================================

(() => {
  const { $, $$ } = window.Tienda;
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatoNumero = (n) => n.toLocaleString("es-AR");

  // ---------- Aparición al hacer scroll ----------
  const revelables = $$("[data-revelar]");
  if ("IntersectionObserver" in window && !sinMovimiento) {
    document.documentElement.classList.add("js-animar");

    // Los elementos hermanos aparecen escalonados
    revelables.forEach((el) => {
      const hermanos = [...el.parentElement.children].filter((h) => h.hasAttribute("data-revelar"));
      const i = hermanos.indexOf(el);
      if (i > 0) el.style.setProperty("--retraso", `${Math.min(i, 5) * 0.08}s`);
    });

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("visible");
          observador.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revelables.forEach((el) => observador.observe(el));
  }

  // ---------- Contadores de la esencia ----------
  const contadores = $$("[data-contar]");
  function contar(el) {
    const final = Number(el.dataset.contar);
    const duracion = 1600;
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = formatoNumero(Math.round(final * suave));
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }
  if ("IntersectionObserver" in window && !sinMovimiento) {
    const obsContadores = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          contar(e.target);
          obsContadores.unobserve(e.target);
        });
      },
      { threshold: 0.6 },
    );
    contadores.forEach((el) => {
      el.textContent = "0";
      obsContadores.observe(el);
    });
  }

  // ---------- Parallax suave de la portada ----------
  const visual = $("[data-parallax]");
  if (visual && !sinMovimiento) {
    const img = $(".portada__foto img", visual);
    let pendiente = false;
    window.addEventListener(
      "scroll",
      () => {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => {
          const y = Math.min(window.scrollY, 900);
          img.style.setProperty("--desplazar", `${(y * 0.08).toFixed(1)}px`);
          pendiente = false;
        });
      },
      { passive: true },
    );
  }

  // ---------- Categorías: flechas del carrusel (celular y tablet) ----------
  const lista = $("#categorias");
  if (lista)
    $$("[data-mover]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const tarjeta = lista.querySelector(".categoria");
        const ancho = tarjeta ? tarjeta.getBoundingClientRect().width + 16 : 300;
        lista.scrollBy({ left: Number(btn.dataset.mover) * ancho, behavior: sinMovimiento ? "auto" : "smooth" });
      }),
    );

  // ---------- Detalles: cambia la imagen según el paso que se está leyendo ----------
  const pasos = $$("[data-paso]");
  const imagenesPaso = $$("[data-paso-img]");
  const pasoActual = $("#pasoActual");
  function activarPaso(i) {
    pasos.forEach((p) => p.classList.toggle("activo", Number(p.dataset.paso) === i));
    imagenesPaso.forEach((img) => img.classList.toggle("activa", Number(img.dataset.pasoImg) === i));
    if (pasoActual) pasoActual.textContent = String(i + 1).padStart(2, "0");
  }
  if ("IntersectionObserver" in window) {
    const obsPasos = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => e.isIntersecting && activarPaso(Number(e.target.dataset.paso)));
      },
      // Se activa el paso que cruza la franja del medio de la pantalla
      { rootMargin: "-45% 0px -45% 0px" },
    );
    pasos.forEach((p) => obsPasos.observe(p));
  }

  // ---------- Testimonios (cambian solos; se pausan con el mouse encima) ----------
  const testimonios = $$("[data-testimonio]");
  if (testimonios.length > 1) iniciarTestimonios();

  function iniciarTestimonios() {
    const puntos = $$("[data-ir]");
    let actual = 0;
    let intervalo;

    function mostrarTestimonio(i) {
      actual = (i + testimonios.length) % testimonios.length;
      testimonios.forEach((t, j) => {
        t.classList.toggle("activo", j === actual);
        t.setAttribute("aria-hidden", String(j !== actual));
      });
      puntos.forEach((p, j) => {
        p.classList.toggle("activo", j === actual);
        p.setAttribute("aria-selected", String(j === actual));
      });
    }

    const arrancar = () => {
      if (sinMovimiento) return;
      clearInterval(intervalo);
      intervalo = setInterval(() => mostrarTestimonio(actual + 1), 6500);
    };

    puntos.forEach((p) =>
      p.addEventListener("click", () => {
        mostrarTestimonio(Number(p.dataset.ir));
        arrancar();
      }),
    );
    const caja = $(".testimonios");
    caja.addEventListener("mouseenter", () => clearInterval(intervalo));
    caja.addEventListener("mouseleave", arrancar);
    arrancar();
  }
})();
