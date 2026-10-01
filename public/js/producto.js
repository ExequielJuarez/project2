// ==========================================================
// PRODUCTO — Interacciones propias de la vista (usa base.js)
// Galería, visor a pantalla completa, color, cantidad,
// calculador de envío y barra de compra fija.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, mostrarToast, agregarAlCarrito } = window.Tienda;

  const producto = $(".producto");
  const nombre = producto.dataset.nombre;
  const numero = (n) => String(n).padStart(2, "0");

  // ---------- Galería (carrusel en celular / tablet) ----------
  const pista = $("#galeriaPista");
  const fotos = $$(".foto", pista);
  const miniaturas = $$(".miniatura");
  const fotoActual = $("#fotoActual");
  const progreso = $("#galeriaProgreso");
  const total = fotos.length;

  function marcarActiva(indice) {
    fotoActual.textContent = numero(indice + 1);
    progreso.style.width = `${((indice + 1) / total) * 100}%`;
    miniaturas.forEach((m, i) => m.classList.toggle("activa", i === indice));
  }

  function irAFoto(indice) {
    pista.scrollTo({ left: fotos[indice].offsetLeft - pista.offsetLeft, behavior: "smooth" });
  }

  pista.addEventListener(
    "scroll",
    () => marcarActiva(Math.round(pista.scrollLeft / pista.clientWidth)),
    { passive: true }
  );

  miniaturas.forEach((m) =>
    m.addEventListener("click", () => irAFoto(Number(m.dataset.indice)))
  );

  marcarActiva(0);

  // ---------- Visor a pantalla completa ----------
  const visor = $("#visor");
  const visorFoto = $("#visorFoto");
  const visorContador = $("#visorContador");
  let indiceVisor = 0;
  let inicioToque = null;

  function pintarVisor() {
    const esOscura = fotos[indiceVisor].classList.contains("foto--oscura");
    const img = $("img", fotos[indiceVisor]);
    visorFoto.classList.toggle("foto--oscura", esOscura && !img);
    visorFoto.innerHTML = img
      ? `<img src="${img.src}" alt="${img.alt}" class="visor__img">`
      : `<span class="foto__texto">(IMAGEN ${indiceVisor + 1})</span>`;
    visorContador.textContent = `${numero(indiceVisor + 1)} / ${numero(total)}`;
  }

  function abrirVisor(indice) {
    indiceVisor = indice;
    pintarVisor();
    visor.hidden = false;
    document.body.classList.add("bloqueado");
    $("#visorCerrar").focus();
  }

  function cerrarVisor() {
    visor.hidden = true;
    document.body.classList.remove("bloqueado");
    fotos[indiceVisor].focus({ preventScroll: true });
  }

  function moverVisor(paso) {
    indiceVisor = (indiceVisor + paso + total) % total;
    pintarVisor();
  }

  fotos.forEach((f) => f.addEventListener("click", () => abrirVisor(Number(f.dataset.indice))));
  $("#visorCerrar").addEventListener("click", cerrarVisor);
  $("#visorPrev").addEventListener("click", () => moverVisor(-1));
  $("#visorSig").addEventListener("click", () => moverVisor(1));
  visor.addEventListener("click", (e) => e.target === visor && cerrarVisor());

  document.addEventListener("keydown", (e) => {
    if (visor.hidden) return;
    if (e.key === "Escape") cerrarVisor();
    if (e.key === "ArrowLeft") moverVisor(-1);
    if (e.key === "ArrowRight") moverVisor(1);
  });

  // Deslizar con el dedo dentro del visor
  visor.addEventListener("touchstart", (e) => (inicioToque = e.touches[0].clientX), { passive: true });
  visor.addEventListener("touchend", (e) => {
    if (inicioToque === null) return;
    const delta = e.changedTouches[0].clientX - inicioToque;
    if (Math.abs(delta) > 50) moverVisor(delta < 0 ? 1 : -1);
    inicioToque = null;
  });

  // ---------- Color ----------
  $$('input[name="color"]').forEach((input) =>
    input.addEventListener("change", () => ($("#colorElegido").textContent = input.value))
  );

  // ---------- Cantidad ----------
  const inputCantidad = $("#cantidad");
  const maximo = Number(inputCantidad.max) || 99;

  function fijarCantidad(valor) {
    inputCantidad.value = Math.min(Math.max(1, valor || 1), maximo);
  }

  $$("[data-cantidad]").forEach((btn) =>
    btn.addEventListener("click", () =>
      fijarCantidad(Number(inputCantidad.value) + Number(btn.dataset.cantidad))
    )
  );
  inputCantidad.addEventListener("change", () => fijarCantidad(Number(inputCantidad.value)));

  // ---------- Agregar / comprar ----------
  // Talle (solo prendas que lo tienen)
  $$('input[name="talle"]').forEach((input) =>
    input.addEventListener("change", () => {
      $("#talleElegido").textContent = input.value;
      $("#talleAyuda").hidden = true;
      $("#opcionTalle").classList.remove("opcion--error");
    })
  );
  const falta = () => {
    if (!$('input[name="talle"]') || $('input[name="talle"]:checked')) return false;
    $("#talleAyuda").hidden = false;
    $("#opcionTalle").classList.add("opcion--error");
    $("#opcionTalle").scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  };

  const datosCompra = (boton) => ({
    id: producto.dataset.id,
    nombre,
    cantidad: Number(inputCantidad.value),
    color: $('input[name="color"]:checked')?.value,
    talle: $('input[name="talle"]:checked')?.value,
    boton,
  });

  ["#btnAgregar", "#btnAgregarBarra"].forEach((sel) => {
    const boton = $(sel);
    boton.addEventListener("click", () => !falta() && agregarAlCarrito(datosCompra(boton)));
  });

  // Comprar ahora: agrega y lleva directo al carrito
  $(".compra__ahora").addEventListener("click", async (e) => {
    if (falta()) return;
    const r = await agregarAlCarrito(datosCompra(e.currentTarget));
    if (r) window.location.href = "/carrito";
  });

  // ---------- Calculador de envío (demo) ----------
  const precio = Number(producto.dataset.precio);
  const formatoPrecio = (n) =>
    "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  $("#formEnvio").addEventListener("submit", (e) => {
    e.preventDefault();
    const cp = $("#codigoPostal").value.trim();
    const lista = $("#envioResultados");
    lista.hidden = false;

    if (!/^\d{4}$/.test(cp)) {
      lista.innerHTML = '<li class="envio__error">Ingresá un código postal de 4 dígitos.</li>';
      return;
    }

    const gratis = precio >= 150000;
    const opciones = [
      { nombre: "Envío a domicilio", plazo: "3 a 5 días hábiles", costo: gratis ? 0 : 6500 },
      { nombre: "Envío express", plazo: "24 a 48 hs", costo: 11900 },
      { nombre: "Retiro en showroom", plazo: "Listo en 24 hs", costo: 0 },
    ];

    lista.innerHTML = opciones
      .map(
        (o) => `<li><span>${o.nombre}<small>${o.plazo}</small></span>
                <strong>${o.costo ? formatoPrecio(o.costo) : "Gratis"}</strong></li>`
      )
      .join("");
  });

  // ---------- Columna de info fija en PC ----------
  // Si la info entra en pantalla se fija arriba; si es más alta,
  // se fija por abajo para poder leerla entera al hacer scroll.
  const info = $(".info");
  const header = $("#header");

  function ajustarInfo() {
    const arriba = header.offsetHeight + 24;
    const alto = info.offsetHeight;
    const top = alto + arriba > window.innerHeight ? window.innerHeight - alto - 24 : arriba;
    info.style.setProperty("--info-top", `${top}px`);
  }

  ajustarInfo();
  window.addEventListener("resize", ajustarInfo);
  $$(".acordeon__titulo, #formEnvio button", info).forEach((el) =>
    el.addEventListener("click", () => requestAnimationFrame(ajustarInfo))
  );

  // ---------- Barra de compra fija ----------
  const barra = $("#barraCompra");
  const compra = $("#compra");

  new IntersectionObserver(([entrada]) => {
    // Se muestra cuando el botón principal ya quedó arriba de la pantalla
    const pasado = !entrada.isIntersecting && entrada.boundingClientRect.top < 0;
    barra.classList.toggle("visible", pasado);
    barra.setAttribute("aria-hidden", String(!pasado));
    $("#btnAgregarBarra").tabIndex = pasado ? 0 : -1;
    document.body.classList.toggle("con-barra", pasado);
  }).observe(compra);
});
