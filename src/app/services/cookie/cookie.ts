import { Injectable } from '@angular/core';

export interface CookieOptions {
  diasExpiracion?: number;
  path?: string;
}

/**
 * Servicio transversal de gestión de Cookies de Sesión (RFC 6265).
 * Usado por: AuthService (HU-07), CartService y PedidoService (HU-10/HU-11),
 * y por el panel de filtros del catálogo (HU-04, persistencia de criterios).
 * Toda cookie se persiste con los atributos de seguridad Secure y
 * SameSite=Strict exigidos por la sección 2.3.1 del informe FocusMind.
 */
@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly atributosSeguridad = 'Secure; SameSite=Strict';

  obtener(nombre: string): string | null {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    const prefijo = `${nombre}=`;
    const encontrada = cookies.find(cookie => cookie.startsWith(prefijo));
    return encontrada ? decodeURIComponent(encontrada.substring(prefijo.length)) : null;
  }

  // Si el JSON está corrupto o no existe, devuelve null en vez de lanzar error.
  obtenerJSON<T>(nombre: string): T | null {
    const valor = this.obtener(nombre);
    if (!valor) {
      return null;
    }

    try {
      return JSON.parse(valor) as T;
    } catch {
      return null;
    }
  }

  guardar(nombre: string, valor: string, opciones: CookieOptions = {}): void {
    const path = opciones.path ?? '/';
    const dias = opciones.diasExpiracion ?? 1;
    const fechaExpiracion = new Date();
    fechaExpiracion.setTime(fechaExpiracion.getTime() + dias * 24 * 60 * 60 * 1000);

    document.cookie =
      `${nombre}=${encodeURIComponent(valor)}; expires=${fechaExpiracion.toUTCString()}; ` +
      `path=${path}; ${this.atributosSeguridad}`;
  }

  guardarJSON(nombre: string, valor: unknown, opciones: CookieOptions = {}): void {
    this.guardar(nombre, JSON.stringify(valor), opciones);
  }

  // Fecha en el pasado = forma estándar de invalidar una cookie en el navegador.
  eliminar(nombre: string, path: string = '/'): void {
    document.cookie =
      `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; ${this.atributosSeguridad}`;
  }

  existe(nombre: string): boolean {
    return this.obtener(nombre) !== null;
  }
}