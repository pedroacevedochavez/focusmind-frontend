import { Injectable, computed, signal } from '@angular/core';
import { CookieService } from '../cookie/cookie';
import { FM_COOKIE_KEYS } from '../../constants/cookies/cookies';
import { ItemCarrito } from '../../models/pedido/pedido';

// ══════════════════════════════════════════════════════════════════
//  US-09 / US-10 — Carrito de compras persistido en cookie de sesión
//  temporal (3 días). Usado por el detalle dinámico del producto
//  (agregar al carrito) y por el Checkout (resumen y total a pagar).
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<ItemCarrito[]>([]);
  readonly items = this._items.asReadonly();

  readonly cantidadTotal = computed(() =>
    this._items().reduce((acumulado, item) => acumulado + item.cantidad, 0),
  );

  readonly montoTotal = computed(() =>
    this._items().reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0),
  );

  constructor(private cookieService: CookieService) {
    const carritoGuardado = this.cookieService.obtenerJSON<ItemCarrito[]>(FM_COOKIE_KEYS.CARRITO);
    if (carritoGuardado) {
      this._items.set(carritoGuardado);
    }
  }

  // Si el producto ya está en el carrito, suma cantidades en vez de duplicar la fila.
  agregar(item: ItemCarrito): void {
    const items = [...this._items()];
    const existente = items.find(actual => actual.productoId === item.productoId);

    if (existente) {
      existente.cantidad += item.cantidad;
    } else {
      items.push(item);
    }

    this._items.set(items);
    this.persistir();
  }

  // Cantidad <= 0 elimina el ítem del carrito (mismo filter de abajo que eliminar()).
  actualizarCantidad(productoId: number, cantidad: number): void {
    const items = this._items()
      .map(item => (item.productoId === productoId ? { ...item, cantidad } : item))
      .filter(item => item.cantidad > 0);

    this._items.set(items);
    this.persistir();
  }

  eliminar(productoId: number): void {
    this._items.set(this._items().filter(item => item.productoId !== productoId));
    this.persistir();
  }

  vaciar(): void {
    this._items.set([]);
    this.cookieService.eliminar(FM_COOKIE_KEYS.CARRITO);
  }

  private persistir(): void {
    this.cookieService.guardarJSON(FM_COOKIE_KEYS.CARRITO, this._items(), { diasExpiracion: 3 });
  }
}