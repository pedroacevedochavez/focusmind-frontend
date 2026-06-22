import { Injectable, computed, signal } from '@angular/core';
import { CookieService } from '../cookie/cookie';
import { FM_COOKIE_KEYS } from '../../constants/cookies/cookies';
import { Usuario } from '../../models/usuario/usuario';

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
//  HU-07 — Módulo de Autenticación: Login con Reactive Forms (Sprint 2)
//  Gestiona la cookie de sesión (RFC 6265, Secure + SameSite=Strict)
//  que habilita la visibilidad contextual del Navbar (HU-08) y el
//  Route Guard del Dashboard / Checkout (HU-10 / HU-11).
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal de estado reactivo de sesión activa (HU-08): dispara la re-evaluación del Navbar sin recargar la SPA.
  private readonly _sesionActiva = signal<boolean>(false);
  readonly sesionActiva = this._sesionActiva.asReadonly();

  // Computed Signal: deriva el usuario visible combinando el perfil mock con el email real de la cookie de sesión.
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
   * Autenticación simulada (HU-07): la verificación contra un servicio de negocio real
   * queda diferida al Trabajo Final. Crea la cookie de sesión con vigencia de 1 día.
   */
  // Validación de negocio simulada: toda combinación de email/password no vacíos autentica con éxito.
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