// ==========================================================
// MIS PEDIDOS — Filtros por estado (usa base.js)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$ } = window.Tienda;
  const botones = $$("[data-filtro]");
  const pedidos = $$("#listaPedidos > li");
  const sinResultados = $("#sinResultados");
  if (!botones.length) return;

  function filtrar(filtro) {
    let visibles = 0;
    pedidos.forEach((p) => {
      const ver = filtro === "todos" || p.dataset.grupo === filtro;
      p.hidden = !ver;
      if (ver) visibles++;
    });
    botones.forEach((b) => {
      b.classList.toggle("activo", b.dataset.filtro === filtro);
      b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro));
    });
    sinResultados.hidden = visibles > 0;
    // El filtro queda en la URL (se puede compartir o volver atrás)
    const url = new URL(location.href);
    if (filtro === "todos") url.searchParams.delete("ver");
    else url.searchParams.set("ver", filtro);
    history.replaceState(null, "", url);
  }

  botones.forEach((b) => b.addEventListener("click", () => filtrar(b.dataset.filtro)));
});
