import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart/cart';
import { PedidoService } from '../../services/pedido/pedido';
import { PaymentService } from '../../services/payment/payment';
import { ItemCarrito, PedidoEntrada } from '../../models/pedido/pedido';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — checkout.component.ts
//  HU-11: Carrito de Compras y Checkout. Reactive Forms con validador
//  condicional dinámico sobre el número de tarjeta según el método de
//  pago.
//  HU-19: PaymentService sigue simulado (no existe todavía HU de
//  pasarela de pago real — ver nota en payment.service.ts). Al recibir
//  su transaccionId simulado, se confirma el pedido de verdad contra
//  POST /api/pedidos (HU-18, transacción ACID con descuento de stock).
//  Si el backend rechaza el pedido (stock insuficiente, producto ya no
//  disponible, número de pedido duplicado), se muestra el motivo en
//  vez de fallar en silencio.
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
  procesandoPago = false;
  errorCheckout: string | null = null;

  private suscripcionMetodoPago?: Subscription;

  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly pedidoService = inject(PedidoService);
  private readonly paymentService = inject(PaymentService);
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

  // Suscripción RxJS al cambio de método de pago, para reevaluar el validador condicional de tarjeta.
  ngOnInit(): void {
    this.suscripcionMetodoPago = this.formulario
      .get('metodoPago')!
      .valueChanges.subscribe((metodo: string) => this.actualizarValidadorTarjeta(metodo));
  }

  // Libera la suscripción al destruir el componente, evitando memory leaks.
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

    this.procesandoPago = true;
    this.errorCheckout = null;

    this.paymentService
      .procesarPago({
        monto:         this.montoTotal,
        metodoPago:    valores.metodoPago,
        numeroTarjeta: valores.numeroTarjeta,
        cliente: {
          nombreCompleto: valores.nombreCompleto,
          direccion:      valores.direccion,
          ciudad:         valores.ciudad,
          telefono:       valores.telefono,
        },
      })
      .subscribe(respuesta => {
        if (!respuesta.exito) {
          this.procesandoPago = false;
          this.errorCheckout = 'No se pudo procesar el pago. Intenta nuevamente.';
          return;
        }

        const entrada: PedidoEntrada = {
          numeroPedido:     respuesta.transaccionId,
          nombreCliente:    valores.nombreCompleto,
          direccionEnvio:   valores.direccion,
          ciudadEnvio:      valores.ciudad,
          telefonoContacto: valores.telefono,
          metodoPago:       valores.metodoPago,
          numeroTarjeta:    valores.numeroTarjeta,
          items: this.items.map(item => ({ idProducto: item.productoId, cantidad: item.cantidad })),
        };

        this.pedidoService.confirmar(entrada).subscribe({
          next: pedido => {
            this.procesandoPago = false;
            this.cartService.vaciar();
            this.pedidoConfirmado = true;
            this.numeroPedidoConfirmado = pedido.id;
          },
          error: (error: unknown) => {
            this.procesandoPago = false;
            this.errorCheckout = this.extraerMensajeError(error);
          },
        });
      });
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private extraerMensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.error === 'string') {
      return error.error.error;
    }
    return 'No se pudo confirmar el pedido. Intenta nuevamente.';
  }
}
