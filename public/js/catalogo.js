// ==========================================================
// CATÁLOGO — Interacciones propias de la vista (usa base.js)
// Panel de filtros, filtrado, orden y cambio de vista.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, abrirPanel, cerrarPaneles } = window.Tienda;

  const filtros = $("#filtros");
  const grilla = $("#grilla");
  const tarjetas = $$(".tarjeta", grilla);
  const vacio = $("#vacio");
  const selectOrden = $("#orden");
  const precioMin = $("#precioMin");
  const precioMax = $("#precioMax");
  const chipsActivos = $("#chipsActivos");
  const badgeFiltros = $("#badgeFiltros");
  const cantidadVisible = $("#cantidadVisible");

  // ---------- Panel de filtros (celular / tablet) ----------
  $("#btnFiltros").addEventListener("click", () => abrirPanel(filtros));
  $("#btnCerrarFiltros").addEventListener("click", cerrarPaneles);
  $("#btnAplicar").addEventListener("click", cerrarPaneles);

  // ---------- Filtrado ----------
  const formatoPrecio = (n) =>
    "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

  function leerFiltros() {
    return {
      categorias: $$('input[name="categoria"]:checked').map((i) => i.value),
      colores: $$('input[name="color"]:checked').map((i) => i.value),
      talles: $$('input[name="talle"]:checked').map((i) => i.value),
      min: parseFloat(precioMin.value) || 0,
      max: parseFloat(precioMax.value) || Infinity,
    };
  }

  function aplicarFiltros() {
    const f = leerFiltros();
    let visibles = 0;

    tarjetas.forEach((t) => {
      const precio = Number(t.dataset.precio);
      const pasa =
        (!f.categorias.length || f.categorias.includes(t.dataset.categoria)) &&
        (!f.colores.length || f.colores.includes(t.dataset.color)) &&
        (!f.talles.length || f.talles.some((x) => t.dataset.talles.split(",").includes(x))) &&
        precio >= f.min &&
        precio <= f.max;

      t.hidden = !pasa;
      if (pasa) visibles++;
    });

    vacio.hidden = visibles > 0;
    cantidadVisible.textContent = visibles;
    pintarChips(f);
  }

  function pintarChips(f) {
    const chips = [
      ...f.categorias.map((v) => ({ tipo: "categoria", valor: v, texto: v })),
      ...f.talles.map((v) => ({ tipo: "talle", valor: v, texto: `Talle ${v}` })),
      ...f.colores.map((v) => ({
        tipo: "color",
        valor: v,
        texto: v.charAt(0).toUpperCase() + v.slice(1),
      })),
    ];
    if (f.min || f.max !== Infinity) {
      chips.push({
        tipo: "precio",
        texto: `${formatoPrecio(f.min)} – ${f.max === Infinity ? "∞" : formatoPrecio(f.max)}`,
      });
    }

    chipsActivos.innerHTML = "";
    chips.forEach((c) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = `${c.texto} `;
      chip.insertAdjacentHTML("beforeend", '<span aria-hidden="true">✕</span>');
      chip.setAttribute("aria-label", `Quitar filtro ${c.texto}`);
      chip.addEventListener("click", () => {
        if (c.tipo === "precio") {
          precioMin.value = "";
          precioMax.value = "";
        } else {
          const input = $(`input[name="${c.tipo}"][value="${CSS.escape(c.valor)}"]`);
          if (input) input.checked = false;
        }
        aplicarFiltros();
      });
      chipsActivos.appendChild(chip);
    });

    badgeFiltros.hidden = chips.length === 0;
    badgeFiltros.textContent = chips.length;
  }

  function limpiarFiltros() {
    $$('.filtros input[type="checkbox"]').forEach((i) => (i.checked = false));
    precioMin.value = "";
    precioMax.value = "";
    aplicarFiltros();
  }

  $$('.filtros input[type="checkbox"]').forEach((i) =>
    i.addEventListener("change", aplicarFiltros)
  );
  [precioMin, precioMax].forEach((i) => i.addEventListener("input", aplicarFiltros));
  $("#btnLimpiar").addEventListener("click", limpiarFiltros);
  $$("[data-limpiar]").forEach((b) => b.addEventListener("click", limpiarFiltros));

  // Llegada desde el menú: /catalogo?categoria=Remeras
  const preseleccion = new URLSearchParams(location.search).get("categoria");
  if (preseleccion) {
    const input = $(`input[name="categoria"][value="${CSS.escape(preseleccion)}"]`);
    if (input) {
      input.checked = true;
      aplicarFiltros();
    }
  }

  // ---------- Orden ----------
  selectOrden.addEventListener("change", () => {
    const criterio = selectOrden.value;
    const ordenadas = [...tarjetas].sort((a, b) => {
      switch (criterio) {
        case "precio-asc":
          return a.dataset.precio - b.dataset.precio;
        case "precio-desc":
          return b.dataset.precio - a.dataset.precio;
        case "nombre-asc":
          return a.dataset.nombre.localeCompare(b.dataset.nombre, "es");
        default:
          return a.dataset.orden - b.dataset.orden;
      }
    });
    ordenadas.forEach((t) => grilla.insertBefore(t, vacio));
  });

  // ---------- Cambio de vista (columnas) ----------
  $$(".vista__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".vista__btn").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      grilla.dataset.columnas = btn.dataset.columnas;
    });
  });
});
