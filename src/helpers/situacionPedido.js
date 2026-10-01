// Cómo se le muestra a un cliente el estado de su pedido
// (Mis pedidos y detalle del pedido).
//   clave: para el estilo (curso / ok / alerta / cancelado)
//   texto: resumen corto · detalle: una línea que explica qué sigue
function situacionPedido(p) {
  const retiro = p.entrega === "retiro";
  if (p.estado === "cancelado") {
    return { clave: "cancelado", texto: "Cancelado", detalle: "Este pedido se canceló y no se va a cobrar." };
  }
  if (p.estado === "entregado") {
    return { clave: "ok", texto: "Entregado", detalle: retiro ? "Ya lo retiraste. ¡Que lo disfrutes!" : "Llegó a destino. ¡Que lo disfrutes!" };
  }
  if (p.estado === "enviado") {
    return retiro
      ? { clave: "curso", texto: "Listo para retirar", detalle: "Ya podés pasar a buscarlo por el showroom." }
      : { clave: "curso", texto: "En camino", detalle: "Lo despachamos. Te llega en los próximos días." };
  }
  if (p.pagoEstado === "aprobado") {
    return { clave: "curso", texto: "Pago aprobado", detalle: "Estamos preparando tu pedido." };
  }
  if (p.medioPago === "transferencia") {
    return { clave: "alerta", texto: "Esperando la transferencia", detalle: "Lo preparamos apenas se acredite." };
  }
  if (p.pagoEstado === "rechazado") {
    return { clave: "alerta", texto: "Pago rechazado", detalle: "Podés intentar de nuevo con otra tarjeta." };
  }
  return { clave: "alerta", texto: "Esperando el pago", detalle: "Todavía no recibimos la confirmación del pago." };
}

// Línea de tiempo: recibido → pagado → enviado / listo → entregado
function pasosPedido(p) {
  const orden = { pendiente: 0, pagado: 1, enviado: 2, entregado: 3 };
  const actual = p.estado === "cancelado" ? -1 : Math.max(orden[p.estado] ?? 0, p.pagoEstado === "aprobado" ? 1 : 0);
  const retiro = p.entrega === "retiro";
  return [
    { texto: "Recibido", fecha: p.fecha },
    { texto: p.medioPago === "transferencia" ? "Transferencia acreditada" : "Pago aprobado", fecha: p.pagadoEn },
    { texto: retiro ? "Listo para retirar" : "Enviado" },
    { texto: retiro ? "Retirado" : "Entregado" },
  ].map((paso, i) => ({ ...paso, hecho: i <= actual, actual: i === actual }));
}

module.exports = { situacionPedido, pasosPedido };
