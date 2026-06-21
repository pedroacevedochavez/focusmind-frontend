import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Producto, CATEGORIA_LABELS } from '../../../models/producto.model/producto.model';
import { PRODUCTOS_MOCK } from '../../../data/productos.mock/productos.mock';
import { CartService } from '../../../core/services/cart.service/cart.service';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — detalle.component.ts
//  US-09 (numeración del cliente) — Interfaz Dinámica del Detalle.
//  Añade sobre la ficha técnica estática (US-05/US-06 del documento
//  base, ya implementadas): selector de cantidad, botón "Agregar al
//  carrito" persistido vía CartService/CookieService, confirmación
//  de riesgo cuando el producto no tiene Registro Sanitario vigente
//  (restricción ABET 2) y acceso directo al Checkout (US-10).
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-detalle',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './detalle.html',
  styleUrl:    './detalle.scss',
})
export class DetalleComponent {
  cargando = false;
  noEncontrado = false;
  id: string | null = null;
  producto?: Producto;

  cantidad = signal(1);
  confirmacionCompraRiesgo = signal(false);
  agregadoAlCarrito = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.producto = PRODUCTOS_MOCK.find(p => p.id === Number(this.id));
    this.noEncontrado = !this.producto;
  }

  get categoriaLabel(): string {
    return this.producto ? CATEGORIA_LABELS[this.producto.categoria] : '';
  }

  get tieneRegistroSanitario(): boolean {
    return !!this.producto?.registroSanitario;
  }

  get tieneAlergenos(): boolean {
    return !!this.producto && this.producto.alergenos.length > 0;
  }

  get subtotal(): number {
    return this.producto ? this.producto.precio * this.cantidad() : 0;
  }

  incrementarCantidad(): void {
    if (this.cantidad() < 10) {
      this.cantidad.set(this.cantidad() + 1);
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad() > 1) {
      this.cantidad.set(this.cantidad() - 1);
    }
  }

  solicitarAgregarAlCarrito(): void {
    if (!this.producto) {
      return;
    }

    if (!this.tieneRegistroSanitario && !this.confirmacionCompraRiesgo()) {
      this.confirmacionCompraRiesgo.set(true);
      return;
    }

    this.agregarAlCarritoConfirmado();
  }

  agregarAlCarritoConfirmado(): void {
    if (!this.producto) {
      return;
    }

    this.cartService.agregar({
      productoId: this.producto.id,
      nombre:     this.producto.nombre,
      precio:     this.producto.precio,
      cantidad:   this.cantidad(),
    });

    this.confirmacionCompraRiesgo.set(false);
    this.agregadoAlCarrito.set(true);
    setTimeout(() => this.agregadoAlCarrito.set(false), 3000);
  }

  cancelarConfirmacionRiesgo(): void {
    this.confirmacionCompraRiesgo.set(false);
  }

  irAlCheckout(): void {
    this.agregarAlCarritoConfirmado();
    this.router.navigate(['/checkout']);
  }
}