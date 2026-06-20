import { Injectable, signal } from '@angular/core';
import { CookieService } from '../cookie.service/cookie.service';
import { FM_COOKIE_KEYS } from '../../constants/cookies.constants';
import { Pedido } from '../../models/pedido.model';

// ══════════════════════════════════════════════════════════════════
//  US-10 — Historial de pedidos simulados (Checkout), persistido en
//  cookie (30 días) y consumido por el Dashboard del usuario.
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

  registrar(pedido: Pedido): void {
    const historial = [pedido, ...this._historial()].slice(0, 10);
    this._historial.set(historial);
    this.cookieService.guardarJSON(FM_COOKIE_KEYS.HISTORIAL_PEDIDOS, historial, {
      diasExpiracion: 30,
    });
  }
}