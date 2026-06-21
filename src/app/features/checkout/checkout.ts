import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart/cart';
import { PedidoService } from '../../services/pedido/pedido';
import { ItemCarrito, Pedido } from '../../models/pedido/pedido';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — checkout.component.ts
//  US-10 (numeración del cliente) — Formulario de Simulación de
//  Compra. Reactive Forms con validación condicional del método de
//  pago. Al confirmar: registra el pedido vía PedidoService (cookie
//  de historial, 30 días), vacía el carrito (CartService) y muestra
//  la confirmación con el número de pedido generado.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-checkout',
  standalone:  true,
  imports:     [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl:    './checkout.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {

  readonly formulario: FormGroup;

  pedidoConfirmado = false;
  numeroPedidoConfirmado = '';

  private suscripcionMetodoPago?: Subscription;

  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);

  constructor() {
    this.formulario = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      direccion:      ['', [Validators.required, Validators.minLength(5)]],
      ciudad:         ['', [Validators.required]],
      telefono:       ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      metodoPago:     ['tarjeta', [Validators.required]],
      numeroTarjeta:  ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    });
  }

  ngOnInit(): void {
    this.suscripcionMetodoPago = this.formulario
      .get('metodoPago')!
      .valueChanges.subscribe((metodo: string) => this.actualizarValidadorTarjeta(metodo));
  }

  ngOnDestroy(): void {
    this.suscripcionMetodoPago?.unsubscribe();
  }

  // Número de tarjeta solo es obligatorio si el método de pago es "tarjeta".
  private actualizarValidadorTarjeta(metodo: string): void {
    const controlTarjeta = this.formulario.get('numeroTarjeta')!;

    if (metodo === 'tarjeta') {
      controlTarjeta.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
    } else {
      controlTarjeta.clearValidators();
    }

    controlTarjeta.updateValueAndValidity();
  }

  get items() {
    return this.cartService.items();
  }

  get cantidadTotal(): number {
    return this.cartService.cantidadTotal();
  }

  get montoTotal(): number {
    return this.cartService.montoTotal();
  }

  get carritoVacio(): boolean {
    return this.items.length === 0;
  }

  get metodoPagoEsTarjeta(): boolean {
    return this.formulario.get('metodoPago')?.value === 'tarjeta';
  }

  // Solo marca error si el campo fue tocado (evita errores antes de interactuar).
  campoInvalido(nombre: string): boolean {
    const control = this.formulario.get(nombre);
    return !!control && control.invalid && control.touched;
  }

  /** Disminuye en 1 la cantidad del ítem; lo elimina si llega a 0. */
  disminuirCantidad(item: ItemCarrito): void {
    this.cartService.actualizarCantidad(item.productoId, item.cantidad - 1);
  }

  /** Aumenta en 1 la cantidad del ítem (tope de 10 por producto, igual que en el detalle). */
  aumentarCantidad(item: ItemCarrito): void {
    if (item.cantidad >= 10) {
      return;
    }
    this.cartService.actualizarCantidad(item.productoId, item.cantidad + 1);
  }

  /** Quita por completo el producto del carrito, actualizando la cookie de inmediato. */
  quitarDelCarrito(productoId: number): void {
    this.cartService.eliminar(productoId);
  }

  confirmarCompra(): void {
    if (this.formulario.invalid || this.carritoVacio) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.value;

    const pedido: Pedido = {
      id:            `FM-${Date.now()}`,
      fecha:         new Date().toISOString(),
      items:         this.items,
      total:         this.montoTotal,
      direccionEnvio: `${valores.direccion}, ${valores.ciudad}`,
      metodoPago:    valores.metodoPago,
    };

    this.pedidoService.registrar(pedido);
    this.cartService.vaciar();

    this.pedidoConfirmado = true;
    this.numeroPedidoConfirmado = pedido.id;
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}