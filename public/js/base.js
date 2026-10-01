// ==========================================================
// BASE — Interacciones compartidas por todas las vistas
// Menú, buscador, paneles laterales, acordeones, carrito
// (vía API en sesión), favoritos (vía API), buscador con
// sugerencias, campos de contraseña, menú de cuenta y aviso (toast).
// Expone window.Tienda para que cada vista lo reutilice.
// ==========================================================

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const body = document.body;
  const header = $("#header");
  const overlay = $("#overlay");
  const nav = $("#nav");
  const btnMenu = $("#btnMenu");

  // ---------- Paneles laterales (menú, filtros, etc.) ----------
  function cerrarPaneles() {
    $$(".abierto[data-panel], #nav.abierto").forEach((p) => p.classList.remove("abierto"));
    overlay.classList.remove("visible");
    header.classList.remove("menu-abierto");
    btnMenu.setAttribute("aria-expanded", "false");
    body.classList.remove("bloqueado");
  }

  function abrirPanel(panel) {
    cerrarPaneles();
    panel.classList.add("abierto");
    overlay.classList.add("visible");
    body.classList.add("bloqueado");
  }

  btnMenu.addEventListener("click", () => {
    if (nav.classList.contains("abierto")) return cerrarPaneles();
    abrirPanel(nav);
    header.classList.add("menu-abierto");
    btnMenu.setAttribute("aria-expanded", "true");
  });

  overlay.addEventListener("click", cerrarPaneles);
  document.addEventListener("keydown", (e) => e.key === "Escape" && cerrarPaneles());
  window.matchMedia("(min-width: 1100px)").addEventListener("change", cerrarPaneles);

  // Buscador en celular
  $("#btnBuscarMovil").addEventListener("click", () => {
    const buscador = $("#buscadorMovil");
    buscador.classList.toggle("abierto");
    if (buscador.classList.contains("abierto")) $("input", buscador).focus();
  });

  // Sombra del header al hacer scroll
  window.addEventListener(
    "scroll",
    () => header.classList.toggle("con-sombra", window.scrollY > 10),
    { passive: true }
  );

  // ---------- Acordeones ----------
  $$(".acordeon__titulo").forEach((btn) => {
    btn.addEventListener("click", () => {
      const abierto = btn.parentElement.classList.toggle("abierto");
      btn.setAttribute("aria-expanded", String(abierto));
    });
  });

  // ---------- Aviso ----------
  const toast = $("#toast");
  let timerToast;

  // accion opcional: { texto, href } para mostrar un enlace dentro del aviso
  function mostrarToast(texto, accion = null) {
    toast.textContent = texto;
    if (accion) {
      const link = document.createElement("a");
      link.href = accion.href;
      link.className = "toast__accion";
      link.textContent = accion.texto;
      toast.appendChild(link);
    }
    toast.classList.toggle("con-accion", Boolean(accion));
    toast.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toast.classList.remove("visible"), accion ? 3500 : 2200);
  }

  // ---------- Pedidos al servidor (JSON) ----------
  async function api(url, metodo = "GET", datos = null) {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: datos ? JSON.stringify(datos) : null,
    });
    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok || !json.ok) throw new Error(json.mensaje || "Algo salió mal, probá de nuevo");
    return json;
  }

  // ---------- Carrito ----------
  const contador = $("#contadorCarrito");

  function actualizarContador(cantidad) {
    contador.textContent = cantidad;
    contador.classList.add("pulso");
    setTimeout(() => contador.classList.remove("pulso"), 200);
  }

  async function agregarAlCarrito({ id, nombre, cantidad = 1, color = null, talle = null, boton = null }) {
    if (boton) boton.disabled = true;
    try {
      const r = await api("/carrito/agregar", "POST", { id, cantidad, color, talle });
      actualizarContador(r.cantidad);
      mostrarToast(cantidad > 1 ? `Agregado: ${cantidad} × ${nombre}` : `Agregado: ${nombre}`, {
        texto: "Ver carrito",
        href: "/carrito",
      });
      return r;
    } catch (error) {
      mostrarToast(error.message);
    } finally {
      if (boton) boton.disabled = false;
    }
  }

  $$("[data-agregar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tarjeta = btn.closest(".tarjeta");
      agregarAlCarrito({ id: tarjeta.dataset.id, nombre: tarjeta.dataset.nombre, boton: btn });
    });
  });

  // ---------- Favoritos ----------
  // Los botones con data-fav-id guardan/quitan el producto y se sincronizan
  // entre sí (el mismo producto puede aparecer en varias tarjetas).
  const contadorFav = $("#contadorFavoritos");

  function actualizarFavoritos(id, activo, cantidad) {
    $$(`[data-fav-id="${id}"]`).forEach((b) => {
      b.classList.toggle("activo", activo);
      b.setAttribute("aria-pressed", String(activo));
      b.setAttribute("aria-label", activo ? "Quitar de favoritos" : "Agregar a favoritos");
    });
    contadorFav.textContent = cantidad;
    contadorFav.hidden = cantidad === 0;
    contadorFav.classList.add("pulso");
    setTimeout(() => contadorFav.classList.remove("pulso"), 200);
    document.dispatchEvent(new CustomEvent("favoritos:cambio", { detail: { id, activo, cantidad } }));
  }

  document.addEventListener("click", async (e) => {
    const boton = e.target.closest("[data-fav-id]");
    if (!boton) return;
    e.preventDefault();
    boton.disabled = true;
    try {
      const r = await api(`/favoritos/${boton.dataset.favId}`, "POST");
      actualizarFavoritos(boton.dataset.favId, r.activo, r.cantidad);
      mostrarToast(
        r.activo ? "Guardado en favoritos" : "Quitado de favoritos",
        r.activo && location.pathname !== "/favoritos" ? { texto: "Ver favoritos", href: "/favoritos" } : null
      );
    } catch (error) {
      mostrarToast(error.message);
    } finally {
      boton.disabled = false;
    }
  });

  // ---------- Buscador con sugerencias ----------
  const precio = (n) => "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  $$("[data-buscador]").forEach((form) => {
    const input = $('input[name="q"]', form);
    const caja = $(".sugerencias", form);
    let espera;
    let pedidoActual = 0;
    let activo = -1;

    const opciones = () => $$("[data-opcion]", caja);

    function cerrar() {
      caja.hidden = true;
      input.setAttribute("aria-expanded", "false");
      activo = -1;
    }

    function marcar(i) {
      const lista = opciones();
      if (!lista.length) return;
      activo = (i + lista.length) % lista.length;
      lista.forEach((o, n) => o.setAttribute("aria-selected", String(n === activo)));
      lista[activo].scrollIntoView({ block: "nearest" });
    }

    // Resalta lo que coincide con la búsqueda
    function resaltar(texto, q) {
      const i = texto.toLowerCase().indexOf(q.toLowerCase());
      if (i === -1) return escapar(texto);
      return escapar(texto.slice(0, i)) + "<mark>" + escapar(texto.slice(i, i + q.length)) + "</mark>" + escapar(texto.slice(i + q.length));
    }

    function pintar({ productos, total }, q) {
      const url = `/catalogo?q=${encodeURIComponent(q)}`;
      caja.innerHTML = productos.length
        ? productos
            .map(
              (p) => `
          <a href="/producto/${p.id}" class="sugerencia" role="option" data-opcion aria-selected="false">
            <span class="sugerencia__imagen">${p.imagen ? `<img src="${escapar(p.imagen)}" alt="">` : "IMG"}</span>
            <span class="sugerencia__texto">
              <span class="sugerencia__nombre">${resaltar(p.nombre, q)}</span>
              <small>${resaltar(p.categoria, q)}${p.sinStock ? " · Sin stock" : ""}</small>
            </span>
            <span class="sugerencia__precio">${precio(p.precio)}</span>
          </a>`
            )
            .join("") +
          `<a href="${url}" class="sugerencia sugerencia--todos" role="option" data-opcion aria-selected="false">
             Ver ${total === 1 ? "el resultado" : `los ${total} resultados`} →
           </a>`
        : `<p class="sugerencia sugerencia--vacia">No encontramos “${escapar(q)}”. Probá con otra palabra.</p>`;
      caja.hidden = false;
      input.setAttribute("aria-expanded", "true");
      activo = -1;
    }

    input.addEventListener("input", () => {
      clearTimeout(espera);
      const q = input.value.trim();
      if (q.length < 2) return cerrar();
      espera = setTimeout(async () => {
        const numero = ++pedidoActual;
        try {
          const r = await api(`/buscar/sugerencias?q=${encodeURIComponent(q)}`);
          // Si mientras tanto se siguió escribiendo, esta respuesta ya no sirve
          if (numero === pedidoActual && input.value.trim() === q) pintar(r, q);
        } catch {
          cerrar();
        }
      }, 250);
    });

    input.addEventListener("keydown", (e) => {
      if (caja.hidden) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        marcar(activo + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        marcar(activo - 1);
      } else if (e.key === "Enter" && activo >= 0) {
        e.preventDefault();
        opciones()[activo].click();
      } else if (e.key === "Escape") {
        cerrar();
      }
    });

    input.addEventListener("focus", () => input.value.trim().length >= 2 && caja.innerHTML && (caja.hidden = false));
    document.addEventListener("click", (e) => !form.contains(e.target) && cerrar());

    // Búsqueda vacía: no hace falta ir al catálogo filtrado
    form.addEventListener("submit", (e) => {
      if (!input.value.trim()) {
        e.preventDefault();
        input.focus();
      }
    });
  });

  // ---------- Campos de contraseña ----------
  // Botón para mostrar/ocultar y aviso de mayúsculas activadas
  $$(".clave").forEach((clave) => {
    const input = $("input", clave);
    const boton = $(".clave__ver", clave);
    const avisoMayus = document.getElementById(`${input.id}-mayus`);

    boton?.addEventListener("click", () => {
      const mostrar = input.type === "password";
      input.type = mostrar ? "text" : "password";
      boton.setAttribute("aria-pressed", String(mostrar));
      boton.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
      input.focus();
    });

    if (avisoMayus) {
      ["keydown", "keyup"].forEach((evento) =>
        input.addEventListener(evento, (e) => {
          if (e.getModifierState) avisoMayus.hidden = !e.getModifierState("CapsLock");
        })
      );
      input.addEventListener("blur", () => (avisoMayus.hidden = true));
    }
  });

  // ---------- Menú de la cuenta (usuario logueado) ----------
  const cuentaBtn = $("#cuentaBtn");
  if (cuentaBtn) {
    const menu = $("#cuentaMenu");
    const cerrarMenu = () => {
      menu.hidden = true;
      cuentaBtn.setAttribute("aria-expanded", "false");
    };
    cuentaBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
      cuentaBtn.setAttribute("aria-expanded", String(!menu.hidden));
    });
    document.addEventListener("click", (e) => !menu.contains(e.target) && cerrarMenu());
    document.addEventListener("keydown", (e) => e.key === "Escape" && cerrarMenu());
  }

  // Enlaces de secciones que todavía no existen en la maqueta
  $$("[data-proximamente]").forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarToast("Esta sección llega en una próxima versión");
    })
  );

  // Mensaje que dejó el servidor para mostrar una sola vez
  const flash = $("#flash");
  if (flash) setTimeout(() => mostrarToast(flash.dataset.mensaje), 300);

  window.Tienda = { $, $$, abrirPanel, cerrarPaneles, mostrarToast, api, actualizarContador, actualizarFavoritos, agregarAlCarrito };
})();
