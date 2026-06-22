// Claves de los 5 dominios de persistencia en cookies (RFC 6265) descritos en la sección 2.3.1 del informe.
export const FM_COOKIE_KEYS = {
  SESION: 'fm_sesion',
  FILTROS_CATALOGO: 'fm_filtros_catalogo',
  CARRITO: 'fm_carrito',
  HISTORIAL_PEDIDOS: 'fm_historial_pedidos',
  HISTORIAL_DIAGNOSTICOS: 'fm_historial_diagnosticos',
} as const;