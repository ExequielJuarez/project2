// ==========================================================
// NOTIFICACIONES — Campanita y avisos en vivo (solo admins)
// Se carga en la tienda y en el panel cuando entra un admin.
// Escucha /admin/notificaciones/stream (Server-Sent Events):
// cuando alguien compra, aparece un aviso al instante con un
// botón para ir a ver el pedido.
// ==========================================================

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  const btn = $("#notifBtn");
  if (!btn || !window.EventSource) return;

  const panel = $("#notifPanel");
  const lista = $("#notifLista");
  const contador = $("#notifContador");
  const avisos = $("#notifAvisos");
  const tituloOriginal = document.title.replace(/^\(\d+\)\s*/, "");
  let noLeidas = 0;
  let notificaciones = [];

  // ---------- Preferencias guardadas en este navegador ----------
  const preferencia = {
    leer(clave, defecto) {
      try {
        const v = localStorage.getItem(clave);
        return v === null ? defecto : v === "1";
      } catch {
        return defecto;
      }
    },
    guardar(clave, valor) {
      try {
        localStorage.setItem(clave, valor ? "1" : "0");
      } catch {
        /* sin almacenamiento: no pasa nada */
      }
    },
  };
  let sonidoActivo = preferencia.leer("notifSonido", true);

  // ---------- Utilidades ----------
  const escapar = (t) =>
    String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function haceCuanto(fecha) {
    const seg = Math.max(0, Math.round((Date.now() - new Date(fecha)) / 1000));
    if (seg < 60) return "recién";
    const min = Math.round(seg / 60);
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    return new Date(fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  }

  const ICONOS = {
    pedido:
      '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 8h14l-1.2 12H6.2L5 8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 016 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    stock:
      '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 8l8-4 8 4-8 4-8-4zM4 8v8l8 4 8-4V8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  };

  async function pedir(url, datos) {
    const r = await fetch(url, {
      method: datos ? "POST" : "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: datos ? JSON.stringify(datos) : null,
      keepalive: Boolean(datos),
    });
    return r.json();
  }

  // ---------- Contador (campanita, título de la pestaña, avatar en celular) ----------
  function pintarContador(n) {
    noLeidas = n;
    contador.hidden = n === 0;
    contador.textContent = n > 99 ? "99+" : n;
    btn.setAttribute("aria-label", n ? `Notificaciones (${n} sin leer)` : "Notificaciones");
    document.title = n ? `(${n}) ${tituloOriginal}` : tituloOriginal;
    $("#cuentaBtn")?.classList.toggle("con-avisos", n > 0);
  }

  // ---------- Lista del panel ----------
  function pintarLista() {
    if (!notificaciones.length) {
      lista.innerHTML = '<li class="notif__vacio">No hay notificaciones todavía.</li>';
      return;
    }
    lista.innerHTML = notificaciones
      .map(
        (n) => `
        <li class="notif__item ${n.leida ? "" : "notif__item--nueva"}">
          <a href="${escapar(n.url || "/admin")}" data-id="${n.id}">
            <span class="notif__icono">${ICONOS[n.tipo] || ICONOS.pedido}</span>
            <span class="notif__texto">
              <strong>${escapar(n.titulo)}</strong>
              <span>${escapar(n.mensaje)}</span>
              <small>${haceCuanto(n.fecha)}</small>
            </span>
          </a>
        </li>`
      )
      .join("");
  }

  async function cargar() {
    try {
      const r = await pedir("/admin/notificaciones");
      if (!r.ok) return;
      notificaciones = r.notificaciones;
      pintarLista();
      pintarContador(r.noLeidas);
    } catch {
      /* sin conexión: se reintenta cuando vuelva el stream */
    }
  }

  // ---------- Abrir / cerrar el panel ----------
  function abrir(abrirlo) {
    panel.hidden = !abrirlo;
    btn.setAttribute("aria-expanded", String(abrirlo));
    if (abrirlo) {
      pintarLista(); // refresca los "hace X min"
      // Los avisos emergentes ya están en la lista: se cierran para no taparla
      avisos.querySelectorAll(".aviso-compra").forEach((a) => a.cerrar?.());
    }
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    abrir(panel.hidden);
  });
  document.addEventListener("click", (e) => !panel.hidden && !panel.contains(e.target) && abrir(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && abrir(false));

  // Al tocar una notificación se marca como leída y se va a verla
  lista.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-id]");
    if (!link) return;
    const n = notificaciones.find((x) => String(x.id) === link.dataset.id);
    if (n && !n.leida) pedir("/admin/notificaciones/leidas", { id: n.id });
  });

  $("#notifLeerTodas").addEventListener("click", async () => {
    const r = await pedir("/admin/notificaciones/leidas", {});
    notificaciones.forEach((n) => (n.leida = true));
    pintarLista();
    pintarContador(r.noLeidas ?? 0);
  });

  // ---------- Sonido (dos tonos cortos, generados sin archivos) ----------
  const botonSonido = $("#notifSonido");
  function pintarSonido() {
    botonSonido.textContent = `Sonido: ${sonidoActivo ? "sí" : "no"}`;
    botonSonido.setAttribute("aria-pressed", String(sonidoActivo));
  }
  botonSonido.addEventListener("click", () => {
    sonidoActivo = !sonidoActivo;
    preferencia.guardar("notifSonido", sonidoActivo);
    pintarSonido();
  });
  pintarSonido();

  let audio;
  function sonar() {
    if (!sonidoActivo) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      [880, 1320].forEach((frecuencia, i) => {
        const osc = audio.createOscillator();
        const vol = audio.createGain();
        const inicio = audio.currentTime + i * 0.14;
        osc.frequency.value = frecuencia;
        vol.gain.setValueAtTime(0.0001, inicio);
        vol.gain.exponentialRampToValueAtTime(0.12, inicio + 0.02);
        vol.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.25);
        osc.connect(vol).connect(audio.destination);
        osc.start(inicio);
        osc.stop(inicio + 0.3);
      });
    } catch {
      /* el navegador no permite sonido todavía */
    }
  }

  // ---------- Avisos del navegador (cuando la pestaña está en segundo plano) ----------
  const botonNavegador = $("#notifNavegador");
  const puedePedirPermiso = () => "Notification" in window && Notification.permission === "default";
  botonNavegador.hidden = !puedePedirPermiso();
  botonNavegador.addEventListener("click", async () => {
    await Notification.requestPermission();
    botonNavegador.hidden = !puedePedirPermiso();
  });

  function avisoDelNavegador(n) {
    if (!document.hidden || !("Notification" in window) || Notification.permission !== "granted") return;
    const aviso = new Notification(n.titulo, { body: n.mensaje, tag: `notif-${n.id}` });
    aviso.onclick = () => {
      window.focus();
      location.href = n.url || "/admin";
    };
  }

  // ---------- Aviso emergente ----------
  const DURACION = 10000;

  function mostrarAviso(n) {
    const aviso = document.createElement("div");
    aviso.className = "aviso-compra";
    aviso.setAttribute("role", "alert");
    aviso.style.animationDuration = "";
    aviso.innerHTML = `
      <span class="aviso-compra__icono">${ICONOS[n.tipo] || ICONOS.pedido}</span>
      <div class="aviso-compra__texto">
        <p class="aviso-compra__etiqueta">${n.tipo === "stock" ? "Atención" : "¡Venta!"}</p>
        <p class="aviso-compra__titulo">${escapar(n.titulo)}</p>
        <p class="aviso-compra__mensaje">${escapar(n.mensaje)}</p>
        <a href="${escapar(n.url || "/admin")}" class="aviso-compra__ver">${n.tipo === "stock" ? "Ver producto" : "Ver pedido"} →</a>
      </div>
      <button type="button" class="aviso-compra__cerrar" aria-label="Cerrar aviso">×</button>
      <div class="aviso-compra__tiempo" style="animation-duration:${DURACION}ms"><span style="animation-duration:${DURACION}ms"></span></div>`;

    let restante = DURACION;
    let inicio = Date.now();
    let timer;
    const cerrar = () => {
      clearTimeout(timer);
      aviso.classList.add("saliendo");
      setTimeout(() => aviso.remove(), 300);
    };
    const programar = () => {
      inicio = Date.now();
      timer = setTimeout(cerrar, restante);
    };
    // Si el mouse está encima no se cierra solo
    aviso.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      restante -= Date.now() - inicio;
    });
    aviso.addEventListener("mouseleave", programar);
    aviso.cerrar = cerrar; // para cerrarlo desde afuera sin simular un clic
    $(".aviso-compra__cerrar", aviso).addEventListener("click", cerrar);
    $(".aviso-compra__ver", aviso).addEventListener("click", () => pedir("/admin/notificaciones/leidas", { id: n.id }));

    avisos.prepend(aviso);
    // Como mucho 3 a la vez
    [...avisos.children].slice(3).forEach((a) => a.remove());
    programar();
  }

  // ---------- Conexión en vivo ----------
  const stream = new EventSource("/admin/notificaciones/stream");

  // "hola" llega al conectar y al reconectar: se recarga por si hubo algo mientras tanto
  stream.addEventListener("hola", cargar);

  stream.addEventListener("notificacion", (e) => {
    const n = JSON.parse(e.data);
    if (notificaciones.some((x) => x.id === n.id)) return;
    notificaciones.unshift(n);
    notificaciones = notificaciones.slice(0, 15);
    pintarLista();
    pintarContador(noLeidas + 1);

    btn.classList.remove("sonando");
    void btn.offsetWidth; // reinicia la animación
    btn.classList.add("sonando");

    // El aviso grande solo para ventas; el de stock queda en la campanita
    if (n.tipo === "pedido") {
      mostrarAviso(n);
      sonar();
    }
    avisoDelNavegador(n);
  });

  stream.addEventListener("leidas", (e) => {
    const { noLeidas: n } = JSON.parse(e.data);
    if (n === 0) notificaciones.forEach((x) => (x.leida = true));
    pintarContador(n);
    if (!panel.hidden) pintarLista();
  });

  window.addEventListener("beforeunload", () => stream.close());
})();
