export type MetodoPago = 'tarjeta' | 'yape' | 'contraentrega';

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  fecha: string;
  items: ItemCarrito[];
  total: number;
  direccionEnvio: string;
  metodoPago: MetodoPago;
}