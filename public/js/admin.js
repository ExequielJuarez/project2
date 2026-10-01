// ==========================================================
// ADMIN — Interacciones compartidas del panel
// Menú lateral, aviso (toast), pedidos JSON al servidor y
// modal de confirmación para formularios con data-confirmar.
// Expone window.Admin para que cada vista lo reutilice.
// ==========================================================

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ---------- Menú lateral (celular / tablet) ----------
  const lateral = $("#adminLateral");
  const overlay = $("#adminOverlay");
  const menuBtn = $("#adminMenuBtn");

  function menu(abrir) {
    lateral.classList.toggle("abierto", abrir);
    overlay.classList.toggle("visible", abrir);
    menuBtn.setAttribute("aria-expanded", String(abrir));
    document.body.classList.toggle("bloqueado", abrir);
  }

  menuBtn.addEventListener("click", () => menu(!lateral.classList.contains("abierto")));
  overlay.addEventListener("click", () => menu(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && menu(false));

  // ---------- Aviso ----------
  const toast = $("#toast");
  let timer;
  function mostrarToast(texto) {
    toast.textContent = texto;
    toast.classList.add("visible");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("visible"), 2600);
  }

  const flash = $("#flash");
  if (flash) setTimeout(() => mostrarToast(flash.dataset.mensaje), 200);

  // ---------- Pedidos JSON ----------
  async function api(url, metodo = "GET", datos = null) {
    const r = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: datos ? JSON.stringify(datos) : null,
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok || !json.ok) throw new Error(json.mensaje || "Algo salió mal, probá de nuevo");
    return json;
  }

  // ---------- Modal de confirmación ----------
  // <form data-confirmar="Texto" data-confirmar-titulo="¿Eliminar?"> pide confirmación antes de enviarse
  const modal = $("#modal");
  let formPendiente = null;
  let focoAnterior = null;

  let resolverConfirmacion = null; // para Admin.confirmar()

  function cerrarModal() {
    modal.hidden = true;
    formPendiente = null;
    if (resolverConfirmacion) resolverConfirmacion(false);
    resolverConfirmacion = null;
    focoAnterior?.focus();
  }

  function abrirModal({ titulo, texto, boton }) {
    focoAnterior = document.activeElement;
    $("#modalTitulo").textContent = titulo || "¿Confirmás?";
    $("#modalTexto").textContent = texto || "";
    $("#modalAceptar").textContent = boton || "Aceptar";
    modal.hidden = false;
    $("#modalCancelar").focus();
  }

  // Uso desde JS: if (await Admin.confirmar({ titulo, texto, boton })) { ... }
  function confirmar(opciones) {
    abrirModal(opciones);
    return new Promise((resolver) => (resolverConfirmacion = resolver));
  }

  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!form.dataset.confirmar || form.dataset.confirmado) return;
    e.preventDefault();
    formPendiente = form;
    abrirModal({
      titulo: form.dataset.confirmarTitulo,
      texto: form.dataset.confirmar,
      boton: form.dataset.confirmarBoton || "Eliminar",
    });
  });

  $("#modalCancelar").addEventListener("click", cerrarModal);
  modal.addEventListener("click", (e) => e.target === modal && cerrarModal());
  document.addEventListener("keydown", (e) => e.key === "Escape" && !modal.hidden && cerrarModal());
  $("#modalAceptar").addEventListener("click", () => {
    if (resolverConfirmacion) {
      const resolver = resolverConfirmacion;
      resolverConfirmacion = null;
      modal.hidden = true;
      resolver(true);
      return;
    }
    if (!formPendiente) return;
    formPendiente.dataset.confirmado = "1";
    formPendiente.submit();
  });

  const formatoPrecio = (n) =>
    "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  window.Admin = { $, $$, api, mostrarToast, formatoPrecio, confirmar };
})();
