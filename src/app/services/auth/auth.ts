import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../models/usuario/usuario';

// Forma exacta de FocusMind.DTO.Responses.AuthResponseDto (backend) — ver HU-14.
interface UsuarioBackendDto {
  idUsuario: number;
  nombre: string;
  email: string;
}

interface AuthResponseDto {
  usuario: UsuarioBackendDto;
  accessToken: string;
  refreshToken: string;
}

const CLAVES_ALMACENAMIENTO = {
  ACCESS_TOKEN: 'fm_access_token',
  REFRESH_TOKEN: 'fm_refresh_token',
  USUARIO: 'fm_usuario',
} as const;

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — auth.service.ts
//  HU-19: reemplaza la autenticación simulada (cookie + validación
//  siempre exitosa) por llamadas HTTP reales a FocusMind.API (HU-14).
//  La sesión ya no vive en una cookie (fm_sesion): los tokens JWT se
//  guardan en localStorage y AuthInterceptor los inyecta en cada
//  request saliente. sesionActiva/usuarioActual se mantienen como
//  Signals para no romper la visibilidad contextual del Navbar (HU-08)
//  ni el Route Guard de /dashboard y /checkout.
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _usuarioActual = signal<Usuario | null>(this.leerUsuarioPersistido());
  readonly usuarioActual = this._usuarioActual.asReadonly();

  readonly sesionActiva = computed(() => this._usuarioActual() !== null);

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(respuesta => this.guardarSesion(respuesta)),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  registrar(nombre: string, email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, { nombre, email, password }).pipe(
      tap(respuesta => this.guardarSesion(respuesta)),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  // Usado únicamente por AuthInterceptor ante un 401 con refreshToken vigente.
  refrescarToken(): Observable<string | null> {
    const refreshToken = localStorage.getItem(CLAVES_ALMACENAMIENTO.REFRESH_TOKEN);
    if (!refreshToken) {
      return of(null);
    }

    return this.http.post<AuthResponseDto>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(respuesta => this.guardarSesion(respuesta)),
      map(respuesta => respuesta.accessToken),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(CLAVES_ALMACENAMIENTO.ACCESS_TOKEN);
    localStorage.removeItem(CLAVES_ALMACENAMIENTO.REFRESH_TOKEN);
    localStorage.removeItem(CLAVES_ALMACENAMIENTO.USUARIO);
    this._usuarioActual.set(null);
  }

  estaAutenticado(): boolean {
    return this.obtenerAccessToken() !== null;
  }

  obtenerAccessToken(): string | null {
    return localStorage.getItem(CLAVES_ALMACENAMIENTO.ACCESS_TOKEN);
  }

  private guardarSesion(respuesta: AuthResponseDto): void {
    const usuario: Usuario = {
      id: respuesta.usuario.idUsuario,
      nombre: respuesta.usuario.nombre,
      email: respuesta.usuario.email,
    };

    localStorage.setItem(CLAVES_ALMACENAMIENTO.ACCESS_TOKEN, respuesta.accessToken);
    localStorage.setItem(CLAVES_ALMACENAMIENTO.REFRESH_TOKEN, respuesta.refreshToken);
    localStorage.setItem(CLAVES_ALMACENAMIENTO.USUARIO, JSON.stringify(usuario));
    this._usuarioActual.set(usuario);
  }

  private leerUsuarioPersistido(): Usuario | null {
    const crudo = localStorage.getItem(CLAVES_ALMACENAMIENTO.USUARIO);
    if (!crudo) {
      return null;
    }

    try {
      return JSON.parse(crudo) as Usuario;
    } catch {
      return null;
    }
  }
}
