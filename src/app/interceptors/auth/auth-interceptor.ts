import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth';

// Auditoría de Producción (previa a HU-22): un 401 en /auth/login, /auth/register o
// /auth/refresh NUNCA debe disparar el flujo de "refrescar y reintentar" — esas rutas SON el
// propio subsistema de autenticación, así que reintentarlas vía refrescarToken() (que a su vez
// vuelve a pasar por este mismo interceptor) provocaba una recursión infinita cada vez que el
// refresh token era inválido/expirado: 401 en /auth/refresh → refrescarToken() → nuevo POST
// /auth/refresh → nuevo 401 → ... hasta agotar pila/memoria. Con el rate limiter de HU-20 (10
// solicitudes/IP/hora en /auth/*) el efecto era aún peor: la cuota se agotaba en milisegundos y
// el usuario quedaba bloqueado con 429 en vez de recibir un logout limpio.
const ES_ENDPOINT_DE_AUTH = /\/auth\/(login|register|refresh)(\?|$)/;

// ══════════════════════════════════════════════════════════════════
//  HU-19: inyecta "Authorization: Bearer <accessToken>" en cada request
//  saliente hacia la API cuando hay sesión activa. Ante un 401 en un
//  endpoint protegido, intenta UNA sola vez refrescar el token
//  (AuthService.refrescarToken -> POST /api/auth/refresh) y reintenta
//  la solicitud original; si el refresh también falla, cierra sesión
//  y redirige a /acceso.
// ══════════════════════════════════════════════════════════════════
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.obtenerAccessToken();
  const solicitud = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(solicitud).pipe(
    catchError((error: unknown) => {
      // Sin token no hay nada que refrescar (endpoint público o sesión inexistente). Tampoco
      // sobre los propios endpoints de auth (ver ES_ENDPOINT_DE_AUTH) — evita la recursión.
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !token ||
        ES_ENDPOINT_DE_AUTH.test(request.url)
      ) {
        return throwError(() => error);
      }

      return authService.refrescarToken().pipe(
        switchMap(nuevoToken => {
          if (!nuevoToken) {
            authService.logout();
            router.navigate(['/acceso']);
            return throwError(() => error);
          }

          const solicitudReintentada = request.clone({
            setHeaders: { Authorization: `Bearer ${nuevoToken}` },
          });

          return next(solicitudReintentada);
        }),
      );
    }),
  );
};
