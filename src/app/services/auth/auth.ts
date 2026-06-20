import { Injectable, computed, signal } from '@angular/core';
import { CookieService } from '../cookie.service/cookie.service';
import { FM_COOKIE_KEYS } from '../../constants/cookies.constants';
import { Usuario } from '../../models/usuario.model';

interface SesionPersistida {
  email: string;
  autenticadoEn: string;
}

/** Perfil cognitivo representativo (Mock UI) — la integración con el motor
 *  de recomendación del Quiz cognitivo queda fuera del alcance de este ciclo. */
const USUARIO_MOCK: Usuario = {
  id: 1,
  nombre: 'Pedro Acevedo',
  email: 'pedro.acevedo@focusmind.pe',
  perfilCognitivo: {
    nivelEstres: 6,
    calidadSueno: 7,
    objetivoPrincipal: 'Mejorar la concentración',
  },
};

// ══════════════════════════════════════════════════════════════════
//  US-07 — Módulo de Autenticación y Control de Acceso (Sprint 2)
//  Gestiona la cookie de sesión (RFC 6265, Secure + SameSite=Strict)
//  que habilita la visibilidad contextual del Navbar y el AuthGuard
//  del Dashboard / Checkout.
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _sesionActiva = signal<boolean>(false);
  readonly sesionActiva = this._sesionActiva.asReadonly();

  readonly usuarioActual = computed<Usuario | null>(() => {
    if (!this._sesionActiva()) {
      return null;
    }

    const sesion = this.cookieService.obtenerJSON<SesionPersistida>(FM_COOKIE_KEYS.SESION);
    return { ...USUARIO_MOCK, email: sesion?.email ?? USUARIO_MOCK.email };
  });

  constructor(private cookieService: CookieService) {
    this._sesionActiva.set(this.cookieService.existe(FM_COOKIE_KEYS.SESION));
  }

  /**
   * Simula la autenticación contra el servicio de negocio (diferido al
   * Trabajo Final). Crea la cookie de sesión con un período de validez
   * de 1 día y los atributos de seguridad exigidos por el informe.
   */
  login(email: string, password: string): boolean {
    if (!email || !password) {
      return false;
    }

    const sesion: SesionPersistida = { email, autenticadoEn: new Date().toISOString() };
    this.cookieService.guardarJSON(FM_COOKIE_KEYS.SESION, sesion, { diasExpiracion: 1 });
    this._sesionActiva.set(true);
    return true;
  }

  logout(): void {
    this.cookieService.eliminar(FM_COOKIE_KEYS.SESION);
    this._sesionActiva.set(false);
  }

  estaAutenticado(): boolean {
    return this.cookieService.existe(FM_COOKIE_KEYS.SESION);
  }
}