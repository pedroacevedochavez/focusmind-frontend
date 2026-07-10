// Claves de persistencia en cookies (RFC 6265). HU-19: fm_sesion, fm_historial_pedidos y
// fm_historial_diagnosticos se retiraron — la sesión ahora vive en localStorage como JWT
// (ver AuthService) y los historiales de pedidos/diagnósticos se leen en vivo desde el backend
// real (PedidoService/DiagnosticoService), no desde una cookie local.
export const FM_COOKIE_KEYS = {
  FILTROS_CATALOGO: 'fm_filtros_catalogo',
  CARRITO: 'fm_carrito',
} as const;