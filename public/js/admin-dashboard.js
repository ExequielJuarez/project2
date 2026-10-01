// ==========================================================
// ADMIN · PANEL — Interacciones propias de la vista (usa admin.js)
// Dibuja el gráfico de columnas apiladas (ganancia + costo = ingresos)
// en SVG, con tooltip al pasar el mouse o con el teclado, y
// alterna entre gráfico y tabla.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, formatoPrecio } = window.Admin;

  const contenedor = $("#grafico");
  const tooltip = $("#tooltip");
  const panel = $(".grafico");
  const datos = JSON.parse($("#datosGrafico").textContent).map((d) => ({ ...d, fecha: new Date(d.fecha) }));

  const SVG = "http://www.w3.org/2000/svg";
  const crear = (tag, attrs = {}, padre) => {
    const el = document.createElementNS(SVG, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (padre) padre.appendChild(el);
    return el;
  };

  const compacto = (n) => {
    if (n >= 1e6) return `$${(n / 1e6).toLocaleString("es-AR", { maximumFractionDigits: 1 })} M`;
    if (n >= 1e3) return `$${Math.round(n / 1e3)} mil`;
    return `$${n}`;
  };
  const dia = (f, largo = false) =>
    f.toLocaleDateString("es-AR", largo ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "numeric" });

  // Divisiones "redondas" del eje: 0 / 100 mil / 200 mil…
  function escalaRedonda(maximo, divisiones = 4) {
    const paso0 = maximo / divisiones;
    const potencia = 10 ** Math.floor(Math.log10(paso0 || 1));
    const paso = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= paso0);
    return { paso, tope: paso * divisiones };
  }

  // Path de una barra con puntas redondeadas arriba (4px) y base recta
  function barra(x, y, ancho, alto, redondear) {
    if (alto <= 0) return "";
    const r = redondear ? Math.min(4, ancho / 2, alto) : 0;
    return `M${x},${y + alto} V${y + r} Q${x},${y} ${x + r},${y} H${x + ancho - r} Q${x + ancho},${y} ${x + ancho},${y + r} V${y + alto} Z`;
  }

  function dibujar() {
    contenedor.innerHTML = "";
    const ancho = contenedor.clientWidth;
    const alto = contenedor.clientHeight;
    if (!ancho) return;

    const margen = { arriba: 22, derecha: 4, abajo: 26, izquierda: 58 };
    const w = ancho - margen.izquierda - margen.derecha;
    const h = alto - margen.arriba - margen.abajo;
    const maximo = Math.max(1, ...datos.map((d) => d.ingresos));
    const { paso, tope } = escalaRedonda(maximo);
    const y = (v) => margen.arriba + h - (v / tope) * h;

    const svg = crear("svg", { viewBox: `0 0 ${ancho} ${alto}`, "aria-hidden": "true" }, contenedor);

    // Grilla y eje Y
    const grilla = crear("g", { class: "grilla-y" }, svg);
    const ejeY = crear("g", { class: "eje-y" }, svg);
    for (let v = 0; v <= tope; v += paso) {
      if (v > 0) crear("line", { x1: margen.izquierda, x2: ancho - margen.derecha, y1: y(v), y2: y(v) }, grilla);
      const t = crear("text", { x: margen.izquierda - 10, y: y(v) + 4, "text-anchor": "end" }, ejeY);
      t.textContent = v === 0 ? "$0" : compacto(v);
    }

    // Columnas: ancho máximo 24px, el resto de la franja queda de aire
    const franja = w / datos.length;
    const anchoBarra = Math.max(4, Math.min(24, franja * 0.62));
    const ejeX = crear("g", { class: "eje-x" }, svg);
    const cadaCuanto = Math.ceil(datos.length / Math.max(2, Math.floor(w / 56)));
    const iMax = datos.findIndex((d) => d.ingresos === maximo);

    datos.forEach((d, i) => {
      const x = margen.izquierda + franja * i + (franja - anchoBarra) / 2;
      const g = crear("g", { class: "columna", tabindex: "0", "data-i": i }, svg);
      crear("rect", { class: "columna__zona", x: margen.izquierda + franja * i, y: margen.arriba, width: franja, height: h }, g);

      // Ganancia abajo (negro), 2px de aire, costo arriba (gris)
      const hGanancia = (d.ganancia / tope) * h;
      const hCosto = (d.costo / tope) * h;
      const hay = (v) => v > 0.5;
      const espacio = hay(hGanancia) && hay(hCosto) ? 2 : 0;
      const yGanancia = margen.arriba + h - hGanancia;
      crear("path", { class: "barra-ganancia", d: barra(x, yGanancia, anchoBarra, hGanancia, !hay(hCosto)) }, g);
      crear("path", { class: "barra-costo", d: barra(x, yGanancia - espacio - Math.max(0, hCosto - espacio), anchoBarra, Math.max(0, hCosto - espacio), true) }, g);

      // Etiqueta solo en el día con más ventas
      if (i === iMax) {
        const t = crear("text", { class: "etiqueta-max", x: x + anchoBarra / 2, y: y(d.ingresos) - 7, "text-anchor": "middle" }, svg);
        t.textContent = compacto(d.ingresos);
      }

      // Fechas contadas desde el último día, así el último siempre tiene etiqueta y no se pisan
      if ((datos.length - 1 - i) % cadaCuanto === 0) {
        const t = crear("text", { x: x + anchoBarra / 2, y: alto - 6, "text-anchor": "middle" }, ejeX);
        t.textContent = dia(d.fecha);
      }

      g.addEventListener("mouseenter", () => mostrar(i, g));
      g.addEventListener("focus", () => mostrar(i, g));
      g.addEventListener("mouseleave", ocultar);
      g.addEventListener("blur", ocultar);
    });

    crear("line", { class: "linea-base", x1: margen.izquierda, x2: ancho - margen.derecha, y1: y(0), y2: y(0) }, svg);
  }

  function mostrar(i, g) {
    const d = datos[i];
    tooltip.innerHTML = `
      <strong>${dia(d.fecha, true)}</strong>
      <dl>
        <dt>Pedidos</dt><dd>${d.pedidos}</dd>
        <dt>Ingresos</dt><dd>${formatoPrecio(d.ingresos)}</dd>
        <dt><span class="muestra" style="background:#8a8a8a"></span>Costo</dt><dd>${formatoPrecio(d.costo)}</dd>
        <dt><span class="muestra" style="background:#fff"></span>Ganancia</dt><dd><b>${formatoPrecio(d.ganancia)}</b></dd>
      </dl>`;
    tooltip.hidden = false;

    const caja = g.getBoundingClientRect();
    const base = panel.getBoundingClientRect();
    const t = tooltip.getBoundingClientRect();
    let left = caja.left - base.left + caja.width / 2 - t.width / 2;
    left = Math.max(8, Math.min(left, base.width - t.width - 8));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${contenedor.offsetTop + 4}px`;
  }

  function ocultar() {
    tooltip.hidden = true;
  }

  dibujar();
  let espera;
  window.addEventListener("resize", () => {
    clearTimeout(espera);
    espera = setTimeout(dibujar, 120);
  });

  // ---------- Alternar gráfico / tabla ----------
  const boton = $("#verTabla");
  boton.addEventListener("click", () => {
    const tabla = panel.classList.toggle("con-tabla");
    $("#tablaGrafico").hidden = !tabla;
    boton.textContent = tabla ? "Ver gráfico" : "Ver tabla";
    boton.setAttribute("aria-pressed", String(tabla));
    if (!tabla) dibujar();
  });
});
