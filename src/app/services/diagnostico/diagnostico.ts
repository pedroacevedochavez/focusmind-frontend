import { Injectable, signal } from '@angular/core';
import { CookieService } from '../cookie/cookie';
import { FM_COOKIE_KEYS } from '../../constants/cookies/cookies';
import { Diagnostico } from '../../models/diagnostico/diagnostico';

// ══════════════════════════════════════════════════════════════════
//  Historial de diagnósticos del Quiz Cognitivo, persistido en
//  cookie (30 días) y consumido por el Dashboard del usuario.
//  Solo se invoca registrar() cuando existe una sesión activa
//  (ver QuizComponent.finalizar()); un visitante sin sesión completa
//  el cuestionario con normalidad pero su resultado no se persiste.
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class DiagnosticoService {
  private readonly _historial = signal<Diagnostico[]>([]);
  readonly historial = this._historial.asReadonly();

  constructor(private cookieService: CookieService) {
    const historialGuardado = this.cookieService.obtenerJSON<Diagnostico[]>(
      FM_COOKIE_KEYS.HISTORIAL_DIAGNOSTICOS,
    );
    if (historialGuardado) {
      this._historial.set(historialGuardado);
    }
  }

  // Antepone el más reciente (índice 0 = último diagnóstico, usado por el Dashboard).
  registrar(diagnostico: Diagnostico): void {
    const historial = [diagnostico, ...this._historial()].slice(0, 10);
    this._historial.set(historial);
    this.cookieService.guardarJSON(FM_COOKIE_KEYS.HISTORIAL_DIAGNOSTICOS, historial, {
      diasExpiracion: 30,
    });
  }
}
