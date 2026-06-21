import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service/auth.service';
import { PedidoService } from '../../core/services/pedido.service/pedido.service';
import { PRODUCTOS_MOCK } from '../../data/productos.mock/productos.mock';
import { Producto } from '../../models/producto.model/producto.model';

interface DiagnosticoHistorico {
  fecha: string;
  objetivoPrincipal: string;
  nivelEstres: number;
  calidadSueno: number;
}

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — dashboard.component.ts
//  US-08 (numeración del cliente) — Panel de Control Personalizado.
//  Protegido por authGuard (ver app.routes.ts). Lee el perfil del
//  usuario autenticado desde AuthService (cookie de sesión) y el
//  historial de compras desde PedidoService (cookie de 30 días).
//  El historial de diagnósticos cognitivos es representativo (Mock
//  UI): la integración con el motor del Quiz queda fuera de alcance.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl:    './dashboard.scss',
})
export class DashboardComponent {

  private readonly authService = inject(AuthService);
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuarioActual;
  readonly historialPedidos = this.pedidoService.historial;

  readonly historialDiagnosticos: DiagnosticoHistorico[] = [
    { fecha: '2026-05-12', objetivoPrincipal: 'Mejorar la concentración', nivelEstres: 7, calidadSueno: 5 },
    { fecha: '2026-06-02', objetivoPrincipal: 'Reducir el estrés',        nivelEstres: 6, calidadSueno: 7 },
  ];

  readonly recomendaciones: Producto[] = PRODUCTOS_MOCK
    .filter(producto => producto.objetivo === 'aumentar-concentracion' || producto.objetivo === 'reducir-estres')
    .slice(0, 3);

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}