import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { PedidoService } from '../../services/pedido/pedido';
import { DiagnosticoService } from '../../services/diagnostico/diagnostico';
import { CartService } from '../../services/cart/cart';
import { ItemCarrito } from '../../models/pedido/pedido';
import { PRODUCTOS_MOCK } from '../../data/productos/productos';
import {
  ObjetivoCognitivo,
  OBJETIVO_LABELS,
  Producto,
} from '../../models/producto/producto';

/** Texto neutro mostrado cuando aún no existe ningún diagnóstico registrado. */
const OBJETIVO_NO_SELECCIONADO = 'No seleccionado aún';

interface PerfilCognitivoVista {
  nivelEstres: number;
  calidadSueno: number;
  objetivoLabel: string;
}

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — dashboard.component.ts
//  HU-10: Dashboard Privado del Usuario con Datos en Vivo.
//  Protegido por authGuard (ver app.routes.ts). Lee el perfil del
//  usuario autenticado desde AuthService (cookie de sesión), el
//  historial de compras desde PedidoService (cookie de 30 días) y
//  el historial real de diagnósticos del Quiz Cognitivo desde
//  DiagnosticoService (cookie de 30 días, persistida solo cuando el
//  Quiz se completó con sesión activa — ver QuizComponent).
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl:    './dashboard.css',
})
export class DashboardComponent {

  private readonly authService = inject(AuthService);
  private readonly pedidoService = inject(PedidoService);
  private readonly diagnosticoService = inject(DiagnosticoService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuarioActual;
  readonly historialPedidos = this.pedidoService.historial;
  readonly historialDiagnosticos = this.diagnosticoService.historial;

  /**
   * Perfil Cognitivo — vinculado en vivo al ÚLTIMO diagnóstico del Quiz
   * (DiagnosticoService.registrar() antepone los registros nuevos, por lo
   * que el índice 0 del historial es siempre el más reciente). Mientras
   * no exista ningún diagnóstico (o el historial se limpie), se muestran
   * valores neutros en lugar de datos ficticios.
   */
  readonly perfilCognitivo = computed<PerfilCognitivoVista>(() => {
    const ultimoDiagnostico = this.historialDiagnosticos()[0];

    if (!ultimoDiagnostico) {
      return {
        nivelEstres:   0,
        calidadSueno:  0,
        objetivoLabel: OBJETIVO_NO_SELECCIONADO,
      };
    }

    return {
      nivelEstres:   ultimoDiagnostico.nivelEstres,
      calidadSueno:  ultimoDiagnostico.calidadSueno,
      objetivoLabel: OBJETIVO_LABELS[ultimoDiagnostico.objetivoPrincipal],
    };
  });

  /** "Mi Carrito" — lee el carrito vigente (cookie fm_carrito) en tiempo real. */
  readonly carrito = this.cartService.items;
  readonly cantidadCarrito = this.cartService.cantidadTotal;
  readonly montoCarrito = this.cartService.montoTotal;

  obtenerLabelObjetivo(objetivo: ObjetivoCognitivo): string {
    return OBJETIVO_LABELS[objetivo];
  }

  disminuirCantidadCarrito(item: ItemCarrito): void {
    this.cartService.actualizarCantidad(item.productoId, item.cantidad - 1);
  }

  aumentarCantidadCarrito(item: ItemCarrito): void {
    if (item.cantidad >= 10) {
      return;
    }
    this.cartService.actualizarCantidad(item.productoId, item.cantidad + 1);
  }

  quitarDelCarrito(productoId: number): void {
    this.cartService.eliminar(productoId);
  }

  // Fijo por ahora: no usa el objetivo del último diagnóstico real (mejora futura).
  readonly recomendaciones: Producto[] = PRODUCTOS_MOCK
    .filter(producto => producto.objetivo === 'aumentar-concentracion' || producto.objetivo === 'reducir-estres')
    .slice(0, 3);

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}