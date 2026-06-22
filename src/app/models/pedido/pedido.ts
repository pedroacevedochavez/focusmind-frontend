// Determina la exigencia del validador condicional de número de tarjeta en el Checkout (HU-11).
export type MetodoPago = 'tarjeta' | 'yape' | 'contraentrega';

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

// Registro persistido en el historial del usuario con vigencia de 30 días (HU-11).
export interface Pedido {
  id: string;
  fecha: string;
  items: ItemCarrito[];
  total: number;
  direccionEnvio: string;
  metodoPago: MetodoPago;
}