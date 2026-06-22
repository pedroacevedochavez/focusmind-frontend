import { Injectable, signal } from '@angular/core';
import { CookieService } from '../cookie/cookie';
import { FM_COOKIE_KEYS } from '../../constants/cookies/cookies';
import { Pedido } from '../../models/pedido/pedido';

// ══════════════════════════════════════════════════════════════════
//  HU-11 — Historial de pedidos simulados al confirmar el Checkout,
//  persistido en cookie (30 días) y consumido por el Dashboard (HU-10).
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly _historial = signal<Pedido[]>([]);
  readonly historial = this._historial.asReadonly();

  constructor(private cookieService: CookieService) {
    const historialGuardado = this.cookieService.obtenerJSON<Pedido[]>(
      FM_COOKIE_KEYS.HISTORIAL_PEDIDOS,
    );
    if (historialGuardado) {
      this._historial.set(historialGuardado);
    }
  }

  // Antepone el más reciente y conserva solo los últimos 10 pedidos.
  registrar(pedido: Pedido): void {
    const historial = [pedido, ...this._historial()].slice(0, 10);
    this._historial.set(historial);
    this.cookieService.guardarJSON(FM_COOKIE_KEYS.HISTORIAL_PEDIDOS, historial, {
      diasExpiracion: 30,
    });
  }
}