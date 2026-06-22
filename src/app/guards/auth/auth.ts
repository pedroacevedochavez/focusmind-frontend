import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

// ══════════════════════════════════════════════════════════════════
//  Route Guard de autenticación (CanActivateFn) aplicado a /dashboard
//  y /checkout (HU-10 / HU-11): verifica la cookie de sesión vigente
//  antes de activar el componente; redirige a /acceso si no existe.
// ══════════════════════════════════════════════════════════════════
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  router.navigate(['/acceso']);
  return false;
};