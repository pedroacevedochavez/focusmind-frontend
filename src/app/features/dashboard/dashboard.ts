import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { PedidoService } from '../../services/pedido/pedido';
import { DiagnosticoService } from '../../services/diagnostico/diagnostico';
import { CartService } from '../../services/cart/cart';
import { ItemCarrito } from '../../models/pedido/pedido';
import { ProductoRecomendado } from '../../models/diagnostico/diagnostico';
import { ObjetivoCognitivo, OBJETIVO_LABELS } from '../../models/producto/producto';

/** Texto neutro mostrado cuando aún no existe ningún diagnóstico registrado. */
const OBJETIVO_NO_SELECCIONADO = 'No seleccionado aún';

interface PerfilCognitivoVista {
  nivelEstres: number;
  calidadSueno: number;
  objetivoLabel: string;
}

const PERFIL_COGNITIVO_VACIO: PerfilCognitivoVista = {
  nivelEstres: 0,
  calidadSueno: 0,
  objetivoLabel: OBJETIVO_NO_SELECCIONADO,
};

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — dashboard.component.ts
//  HU-10: Dashboard Privado del Usuario con Datos en Vivo.
//  Protegido por authGuard (ver app.routes.ts).
//
//  HU-19/HU-19b: el perfil cognitivo, las recomendaciones, el
//  historial de diagnósticos y el historial de pedidos se cargan con
//  HTTP real (GET /api/diagnosticos/ultimo — ya enriquecido con
//  alergias + recomendaciones del último diagnóstico —, GET
//  /api/diagnosticos, GET /api/pedidos), no desde cookies.
//
//  El panel "Mis Recomendaciones" (retirado temporalmente en HU-19
//  porque GET /api/diagnosticos/ultimo no exponía alergias ni
//  recomendaciones) queda restaurado: DiagnosticoService.obtenerUltimo()
//  ahora reutiliza el mismo DiagnosticoResultado que ya usaba el Quiz
//  (HU-16), incluyendo las recomendaciones ya calculadas por el
//  backend para ese diagnóstico — no se recalculan en el Frontend.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl:    './dashboard.css',
})
export class DashboardComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly pedidoService = inject(PedidoService);
  private readonly diagnosticoService = inject(DiagnosticoService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuarioActual;
  readonly historialPedidos = this.pedidoService.historial;
  readonly historialDiagnosticos = this.diagnosticoService.historial;

  readonly perfilCognitivo = signal<PerfilCognitivoVista>(PERFIL_COGNITIVO_VACIO);
  readonly recomendaciones = signal<ProductoRecomendado[]>([]);

  /** "Mi Carrito" — lee el carrito vigente (cookie fm_carrito) en tiempo real. */
  readonly carrito = this.cartService.items;
  readonly cantidadCarrito = this.cartService.cantidadTotal;
  readonly montoCarrito = this.cartService.montoTotal;

  ngOnInit(): void {
    this.pedidoService.cargarHistorial();
    this.diagnosticoService.cargarHistorial();

    this.diagnosticoService.obtenerUltimo().subscribe(resultado => {
      if (!resultado) {
        this.perfilCognitivo.set(PERFIL_COGNITIVO_VACIO);
        this.recomendaciones.set([]);
        return;
      }

      this.perfilCognitivo.set({
        nivelEstres: resultado.nivelEstres,
        calidadSueno: resultado.calidadSueno,
        objetivoLabel: OBJETIVO_LABELS[resultado.objetivoPrincipal],
      });
      this.recomendaciones.set(resultado.recomendaciones);
    });
  }

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

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
