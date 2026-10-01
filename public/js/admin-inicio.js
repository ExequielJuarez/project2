// ==========================================================
// ADMIN · PÁGINA DE INICIO — Editor con vista previa en vivo (usa admin.js)
// Contadores, "restaurar original", fotos nuevas, listas que se
// agregan/quitan, aviso de cambios sin guardar y la vista previa
// que se vuelve a armar mientras se escribe.
// ==========================================================

(() => {
  const { $, $$, mostrarToast } = window.Admin;

  const form = $("#formInicio");
  if (!form) return;

  const PREFIJO_PREVIA = form.dataset.prefijoPrevia;
  const MAX_FOTO = 3 * 1024 * 1024;
  const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
  const escaparRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // ==========================================================
  // CAMPOS DE TEXTO: contador y "Restaurar original"
  // ==========================================================
  function revisarTexto(control) {
    const campo = control.closest("[data-texto]");
    if (!campo) return;
    const cuenta = $("[data-cuenta]", campo);
    if (cuenta) {
      const max = Number(control.maxLength);
      cuenta.textContent = `${control.value.length}/${max}`;
      cuenta.classList.toggle("al-limite", control.value.length >= max);
    }
    const restaurar = $("[data-restaurar]", campo);
    if ("original" in control.dataset) {
      const distinto = control.value !== control.dataset.original;
      if (restaurar) restaurar.hidden = !distinto;
    }
    control.classList.toggle("cambiado", control.value !== control.defaultValue);
  }

  form.addEventListener("click", (e) => {
    const restaurar = e.target.closest("[data-restaurar]");
    if (!restaurar) return;
    const control = $(".campo__control", restaurar.closest("[data-texto]"));
    control.value = control.dataset.original;
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.focus();
  });

  // ==========================================================
  // MOSTRAR / OCULTAR SECCIONES
  // ==========================================================
  function revisarVisible(check) {
    const seccion = check.closest(".editor-seccion");
    seccion.classList.toggle("oculta", !check.checked);
    $("[data-estado]", seccion).textContent = check.checked ? "" : "Oculta";
  }

  // ==========================================================
  // FOTOS
  // ==========================================================
  const fotosNuevas = new Map(); // input file → URL temporal para verla antes de subirla

  function pintarFoto(caja) {
    const archivo = $("[data-foto-archivo]", caja);
    const ruta = $("[data-foto-ruta]", caja);
    const nueva = fotosNuevas.get(archivo);
    $("[data-foto-img]", caja).src = nueva || ruta.value;
    $("[data-foto-nueva]", caja).hidden = !nueva;
    $("[data-foto-deshacer]", caja).hidden = !nueva && ruta.value === ruta.defaultValue;
    const original = $("[data-foto-original]", caja);
    if (original) original.hidden = !nueva && ruta.value === ruta.dataset.original;
  }

  function quitarFotoNueva(archivo) {
    const url = fotosNuevas.get(archivo);
    if (url) URL.revokeObjectURL(url);
    fotosNuevas.delete(archivo);
    archivo.value = "";
  }

  form.addEventListener("change", (e) => {
    const archivo = e.target.closest("[data-foto-archivo]");
    if (!archivo) return;
    const caja = archivo.closest("[data-foto]");
    const foto = archivo.files[0];
    if (fotosNuevas.has(archivo)) URL.revokeObjectURL(fotosNuevas.get(archivo));
    fotosNuevas.delete(archivo);

    if (foto) {
      if (!TIPOS_FOTO.includes(foto.type)) {
        archivo.value = "";
        mostrarToast("La foto tiene que ser JPG, PNG o WEBP");
      } else if (foto.size > MAX_FOTO) {
        archivo.value = "";
        mostrarToast("La foto puede pesar hasta 3 MB");
      } else {
        fotosNuevas.set(archivo, URL.createObjectURL(foto));
      }
    }
    pintarFoto(caja);
  });

  form.addEventListener("click", (e) => {
    const deshacer = e.target.closest("[data-foto-deshacer]");
    const original = e.target.closest("[data-foto-original]");
    if (!deshacer && !original) return;
    const caja = e.target.closest("[data-foto]");
    const archivo = $("[data-foto-archivo]", caja);
    const ruta = $("[data-foto-ruta]", caja);
    quitarFotoNueva(archivo);
    ruta.value = deshacer ? ruta.defaultValue : ruta.dataset.original;
    pintarFoto(caja);
    alCambiar();
  });

  // ==========================================================
  // LISTAS QUE SE AGRANDAN (testimonios)
  // ==========================================================
  function renumerar(lista) {
    const base = lista.dataset.lista; // ej: testimonios[items]
    const idBase = "ce-" + base.replace(/\]\[|\[|\]/g, "-").replace(/-$/, "");
    const items = $$("[data-items] > [data-item]", lista);
    const patronNombre = new RegExp("^" + escaparRegex(base) + "\\[(\\d+|__i__)\\]");
    const patronId = new RegExp("^" + escaparRegex(idBase) + "-(\\d+|__i__)-");

    items.forEach((item, i) => {
      $("[data-numero]", item).textContent = i + 1;
      $$("[name]", item).forEach((el) => (el.name = el.name.replace(patronNombre, `${base}[${i}]`)));
      $$("[id]", item).forEach((el) => (el.id = el.id.replace(patronId, `${idBase}-${i}-`)));
      $$("label[for]", item).forEach((el) => (el.htmlFor = el.htmlFor.replace(patronId, `${idBase}-${i}-`)));
    });

    const min = Number(lista.dataset.min);
    const max = Number(lista.dataset.max);
    $$("[data-quitar]", lista).forEach((b) => (b.disabled = items.length <= min));
    $("[data-agregar]", lista).disabled = items.length >= max;
  }

  $$("[data-lista]").forEach((lista) => {
    renumerar(lista);

    $("[data-agregar]", lista).addEventListener("click", () => {
      const nuevo = $("[data-plantilla]", lista).content.firstElementChild.cloneNode(true);
      $("[data-items]", lista).append(nuevo);
      renumerar(lista);
      $(".campo__control", nuevo)?.focus();
      alCambiar();
    });

    lista.addEventListener("click", (e) => {
      const quitar = e.target.closest("[data-quitar]");
      if (!quitar || quitar.disabled) return;
      quitar.closest("[data-item]").remove();
      renumerar(lista);
      alCambiar();
    });
  });

  // ==========================================================
  // CAMBIOS SIN GUARDAR
  // ==========================================================
  const barra = $("#barraGuardar");
  const estadoCambios = $("#estadoCambios");
  const btnDescartar = $("#btnDescartar");
  let enviando = false;

  const serializar = () =>
    [...new FormData(form)].map(([k, v]) => `${k}=${typeof v === "string" ? v : v.name}`).join("&");
  // Si volvió con errores, lo que se ve todavía no está guardado
  const volvioConErrores = Boolean($("#resumenErrores"));
  const estadoInicial = volvioConErrores ? null : serializar();
  const hayCambios = () => serializar() !== estadoInicial;

  function marcarCambios() {
    const cambios = hayCambios();
    barra.classList.toggle("con-cambios", cambios);
    estadoCambios.textContent = cambios ? "Tenés cambios sin guardar" : "Sin cambios";
    btnDescartar.hidden = !cambios;
  }

  window.addEventListener("beforeunload", (e) => {
    if (!enviando && hayCambios()) e.preventDefault();
  });

  form.addEventListener("submit", () => {
    enviando = true;
    const btn = $("#btnGuardar");
    btn.disabled = true;
    btn.textContent = "Guardando…";
  });

  // Si volvió con errores, se va al resumen
  $("#resumenErrores")?.focus();

  // ==========================================================
  // VISTA PREVIA
  // ==========================================================
  const previa = $("#previa");
  const marco = $("#previaMarco");
  const frame = $("#previaFrame");
  const estadoPrevia = $("#estadoPrevia");
  let anchoDispositivo = 1280;
  let pedido; // AbortController del último pedido
  let primeraVez = true;
  let temporizador;

  const previaVisible = () => previa.offsetParent !== null || previa.classList.contains("abierta");

  function escalar() {
    const w = marco.clientWidth;
    const h = marco.clientHeight;
    if (!w || !h) return;
    const margen = anchoDispositivo < w ? 24 : 0;
    const escala = Math.min(1, (w - margen) / anchoDispositivo);
    frame.style.width = `${anchoDispositivo}px`;
    frame.style.height = `${Math.ceil(h / escala)}px`;
    frame.style.transform = `translateX(${Math.max(0, (w - anchoDispositivo * escala) / 2)}px) scale(${escala})`;
  }
  new ResizeObserver(escalar).observe(marco);

  $$("[data-ancho]").forEach((btn) =>
    btn.addEventListener("click", () => {
      anchoDispositivo = Number(btn.dataset.ancho);
      $$("[data-ancho]").forEach((b) => {
        b.classList.toggle("activo", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      escalar();
    })
  );

  // Estilos que se agregan dentro de la vista previa después de la primera
  // carga: sin animaciones de entrada, para que no "salte" en cada tecla
  const SIN_ANIMAR = `<style>
    .portada__renglon > span, .portada__etiqueta, .portada__bajada, .portada__acciones, .portada__visual { animation: none !important; }
    html { scroll-behavior: auto !important; }
  </style>`;
  // Siempre: la portada usa el alto de la pantalla y la vista previa es más
  // alta que una pantalla real (está achicada), así que se limita
  const AJUSTES = `<style>
    .portada__grilla { min-height: min(calc(100vh - 216px), 700px) !important; }
  </style>`;

  async function actualizarPrevia() {
    clearTimeout(temporizador);
    pedido?.abort();
    pedido = new AbortController();

    const datos = new FormData(form);
    const temporales = {};
    // Las fotos elegidas todavía no se suben: se muestran desde el navegador
    for (const [clave, valor] of [...datos]) if (typeof valor !== "string") datos.delete(clave);
    fotosNuevas.forEach((url, archivo) => {
      const ruta = $("[data-foto-ruta]", archivo.closest("[data-foto]"));
      const marca = PREFIJO_PREVIA + archivo.name.slice("archivo:".length);
      datos.set(ruta.name, marca);
      temporales[marca] = url;
    });

    estadoPrevia.textContent = "Actualizando…";
    estadoPrevia.classList.add("cargando");
    try {
      const r = await fetch("/admin/inicio/vista-previa", { method: "POST", body: datos, signal: pedido.signal });
      if (!r.ok) throw new Error();
      let html = await r.text();
      Object.entries(temporales).forEach(([marca, url]) => (html = html.split(marca).join(url)));
      html = html.replace("</head>", `${AJUSTES}${primeraVez ? "" : SIN_ANIMAR}</head>`);

      const y = frame.contentWindow?.scrollY || 0;
      frame.onload = () => {
        const doc = frame.contentDocument;
        // Todo visible de entrada (las animaciones al bajar son para la tienda)
        doc.documentElement.classList.remove("js-animar");
        doc.documentElement.style.scrollBehavior = "auto";
        frame.contentWindow.scrollTo(0, y);
        estadoPrevia.textContent = "Vista previa · sin guardar";
        estadoPrevia.classList.remove("cargando");
        primeraVez = false;
      };
      frame.srcdoc = html;
    } catch (error) {
      if (error.name === "AbortError") return;
      estadoPrevia.textContent = "No se pudo actualizar la vista previa";
      estadoPrevia.classList.remove("cargando");
    }
  }

  function programarPrevia() {
    clearTimeout(temporizador);
    if (!previaVisible()) return; // en celular se arma al abrirla
    estadoPrevia.textContent = "Escribiendo…";
    temporizador = setTimeout(actualizarPrevia, 600);
  }

  // Al abrir una sección, la vista previa baja hasta ella
  function irASeccion(id) {
    const doc = frame.contentDocument;
    const destino = doc?.querySelector(`[data-seccion="${id}"]`);
    if (!destino) return;
    const header = doc.querySelector("#header");
    const top = destino.getBoundingClientRect().top + frame.contentWindow.scrollY - (header ? header.offsetHeight : 0);
    frame.contentWindow.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  $$(".editor-seccion").forEach((seccion) =>
    seccion.addEventListener("toggle", () => seccion.open && irASeccion(seccion.dataset.seccion))
  );

  // Celular y tablet: la vista previa se abre a pantalla completa
  $("#btnAbrirPrevia").addEventListener("click", () => {
    previa.classList.add("abierta");
    document.body.classList.add("bloqueado");
    escalar();
    actualizarPrevia();
  });
  $("#btnCerrarPrevia").addEventListener("click", () => {
    previa.classList.remove("abierta");
    document.body.classList.remove("bloqueado");
  });

  // ==========================================================
  // CUALQUIER CAMBIO
  // ==========================================================
  function alCambiar() {
    marcarCambios();
    programarPrevia();
  }

  form.addEventListener("input", (e) => {
    if (e.target.matches(".campo__control")) revisarTexto(e.target);
    alCambiar();
  });

  form.addEventListener("change", (e) => {
    if (e.target.matches("[data-visible]")) revisarVisible(e.target);
    if (!e.target.matches(".campo__control")) alCambiar();
  });

  $$(".campo__control", form).forEach(revisarTexto);
  if (previaVisible()) actualizarPrevia();
})();
