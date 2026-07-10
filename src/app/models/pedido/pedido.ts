// Determina la exigencia del validador condicional de número de tarjeta en el Checkout (HU-11).
export type MetodoPago = 'tarjeta' | 'yape' | 'contraentrega';

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

// Historial (GET /api/pedidos, HU-18) — resumen, sin el detalle de ítems:
// PedidoListItemResponseDto (backend) no los expone, solo la confirmación de compra
// (POST /api/pedidos) los trae completos (ver PedidoConfirmado).
export interface Pedido {
  id: string; // NumeroPedido (backend) — natural key legible, no el IDPEDIDO interno.
  fecha: string;
  total: number;
  direccionEnvio: string;
  ciudadEnvio: string;
  metodoPago: MetodoPago;
}

export interface PedidoDetalleItem {
  idProducto: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

/** Resultado de POST /api/pedidos (HU-18) — incluye el detalle completo de ítems. */
export interface PedidoConfirmado extends Pedido {
  nombreCliente: string;
  telefonoContacto: string;
  items: PedidoDetalleItem[];
}

/** Entrada de PedidoService.confirmar() — arma PedidoCrearRequestDto para el backend. */
export interface PedidoEntrada {
  numeroPedido: string;
  nombreCliente: string;
  direccionEnvio: string;
  ciudadEnvio: string;
  telefonoContacto: string;
  metodoPago: MetodoPago;
  numeroTarjeta?: string;
  items: { idProducto: number; cantidad: number }[];
}
