import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth/auth';
import { CartService } from './services/cart/cart';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — app.ts (Componente Raíz)
//  HU-08 — Navbar Contextual: consulta el Signal de sesión activa
//  (AuthService.sesionActiva) para alternar entre el enlace "Acceder"
//  y el bloque "Mi Perfil" + botón "Cerrar sesión", sin recargar la SPA.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:     'app-root',
  standalone:   true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.html',
  styleUrl:    './app.css',
})
export class App {
  readonly title = 'FocusMind';

  mobileMenuOpen = false;

  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly sesionActiva = this.authService.sesionActiva;
  readonly usuarioActual = this.authService.usuarioActual;

  // HU-11 — Contador reactivo del carrito, consumido por el badge de la navbar.
  readonly cantidadCarrito = this.cartService.cantidadTotal;

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.mobileMenuOpen = false;
    this.router.navigate(['/home']);
  }
}