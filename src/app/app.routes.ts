// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — app.routes.ts
//  Configuración de rutas con Lazy Loading | Angular 22 Standalone
//
//  Rutas activas:
//    /          → redirige a /home
//    /home      → Landing Page principal (HomeComponent)
//    /dashboard → Panel privado de usuario (DashboardComponent) — authGuard
//    /catalogo  → Catálogo interactivo (CatalogoComponent)
//    /catalogo/:id → Ficha de producto (DetalleComponent)
//    /quiz      → Quiz cognitivo (QuizComponent)
//    /acceso    → Módulo de autenticación (AccesoComponent)
//    /checkout  → Simulación de compra (CheckoutComponent) — authGuard
//    /**        → redirige a /home
//
//  ✔ Mapa de rutas MVP verificado: todas las rutas declaradas en minúsculas,
//    sin alias duplicados ni rutas huérfanas (home, catalogo, catalogo/:id,
//    acceso, dashboard, quiz, checkout).
// ══════════════════════════════════════════════════════════════════
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Ruta raíz: redirige automáticamente a /home ─────────────────────────
  {
    path:       '',
    redirectTo: 'home',
    pathMatch:  'full',
  },

  // ── /home — Landing Page pública de la marca ────────────────────────────
  //    Presenta la propuesta de valor, beneficios y CTA al quiz
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home')
        .then(m => m.HomeComponent),
    title: 'FocusMind — Nootrópicos con Respaldo Científico',
  },

  // ── /dashboard — Panel privado de usuario ───────────────────────────────
  //    Historial de tests, recomendaciones personalizadas.
  //    Protegido por authGuard (CanActivate): verifica la cookie de sesión.
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/dashboard')
        .then(m => m.DashboardComponent),
    title: 'FocusMind — Panel de Control',
  },

  // ── /catalogo — Catálogo interactivo con filtros ────────────────────────
  //    (tarjetas + Data Binding) | (filtros two-way binding)
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./components/catalogo/catalogo')
        .then(m => m.CatalogoComponent),
    title: 'FocusMind — Catálogo de Nootrópicos',
  },

  // ── /catalogo/:id — Ficha técnica de producto ───────────────────────────
  //    (Registro Sanitario DIGESA/DIGEMID, alérgenos, ABET 2)
  {
    path: 'catalogo/:id',
    loadComponent: () =>
      import('./components/catalogo/detalle/detalle')
        .then(m => m.DetalleComponent),
    title: 'FocusMind — Detalle de Producto',
  },

  // ── /acceso — Módulo de Autenticación ─────────────────────────────────
  //    Login con Reactive Forms, cookie de sesión
  {
    path: 'acceso',
    loadComponent: () =>
      import('./components/acceso/acceso')
        .then(m => m.AccesoComponent),
    title: 'FocusMind — Acceso',
  },

  // ── /quiz — Quiz cognitivo con Reactive Forms ─────────────
  //    Apunta al componente actual
  {
    path: 'quiz',
    loadComponent: () =>
      import('./components/quiz/quiz')
        .then(m => m.QuizComponent),
    title: 'FocusMind — Quiz de Diagnóstico Cognitivo',
  },

  // ── /checkout — Formulario de Simulación de Compra ──────────────────────
  //    Protegido por authGuard: solo usuarios autenticados pueden pagar.
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/checkout/checkout')
        .then(m => m.CheckoutComponent),
    title: 'FocusMind — Finalizar Compra',
  },

  // ── Wildcard: cualquier ruta desconocida → /home ──────────────────────
  //    Resiliencia del enrutamiento global: ninguna URL inválida deja al
  //    usuario en una pantalla rota; siempre se redirige a la Landing Page.
  {
    path:       '**',
    redirectTo: 'home',
  },

];