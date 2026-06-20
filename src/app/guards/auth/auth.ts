import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service/auth.service';

// ══════════════════════════════════════════════════════════════════
//  US-07 — Route Guard del Dashboard y del Checkout.
//  Verifica la vigencia de la cookie de sesión antes de autorizar el
//  acceso a rutas privadas; redirige a /acceso si no existe o expiró.
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