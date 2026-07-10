import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Producto, CATEGORIA_LABELS } from '../../../models/producto/producto';
import { ProductoService } from '../../../services/producto/producto';
import { CartService } from '../../../services/cart/cart';
import { AuthService } from '../../../services/auth/auth';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — detalle.component.ts
//  HU-05: Ficha técnica vía Route Parameter dinámico (Input Binding).
//  Extiende la ficha con: selector de cantidad, "Agregar al carrito"
//  (persistido vía CartService/CookieService, HU-11), confirmación de
//  riesgo cuando el producto no tiene Registro Sanitario vigente
//  (restricción ABET 2, HU-06) y acceso directo al Checkout (HU-11).
//
//  "Agregar al carrito" y "Comprar ahora" exigen sesión activa (cookie
//  fm_sesion vía AuthService); sin sesión, la acción se bloquea y el
//  visitante es redirigido al módulo de autenticación (/acceso).
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-detalle',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './detalle.html',
  styleUrl:    './detalle.css',
})
export class DetalleComponent implements OnInit {
  cargando = true;
  noEncontrado = false;
  id: string | null = null;
  producto?: Producto;

  cantidad = signal(1);
  confirmacionCompraRiesgo = signal(false);
  agregadoAlCarrito = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly productoService = inject(ProductoService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.productoService.obtenerPorId(Number(this.id)).subscribe({
      next: producto => {
        this.producto = producto;
        this.noEncontrado = !producto;
        this.cargando = false;
        // Zone.js no siempre detecta este cambio de estado por su cuenta dentro del callback
        // de subscribe (confirmado en depuración: sin esto, la vista quedaba congelada en
        // "Cargando..." pese a que el dato ya había llegado) — se fuerza explícitamente.
        this.cdr.detectChanges();
      },
      // Defensa adicional: con el catchError ya agregado en ProductoService.obtenerPorId este
      // camino no debería dispararse, pero sin un handler de error aquí, una falla no
      // capturada dejaba "Cargando..." para siempre en vez de mostrar "no encontrado".
      error: () => {
        this.noEncontrado = true;
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
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

  // Orden importa: primero login, luego advertencia de riesgo sanitario.
  solicitarAgregarAlCarrito(): void {
    if (!this.producto) {
      return;
    }

    if (!this.authService.sesionActiva()) {
      this.router.navigate(['/acceso']);
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
    if (!this.producto) {
      return;
    }

    if (!this.authService.sesionActiva()) {
      this.router.navigate(['/acceso']);
      return;
    }

    this.agregarAlCarritoConfirmado();
    this.router.navigate(['/checkout']);
  }
}