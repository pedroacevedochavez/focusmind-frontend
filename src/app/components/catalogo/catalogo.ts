import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — catalogo.component.ts
//  Estructura estática (dummy) "En construcción" — Sprint 2:
//  catálogo interactivo con filtros, buscador y tarjetas de producto.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:   'app-catalogo',
  standalone: true,
  imports:    [RouterLink],
  template: `
    <div style="min-height:60vh;display:flex;flex-direction:column;
                align-items:center;justify-content:center;gap:16px;
                background:var(--fm-bg);padding:80px 24px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
           style="width:56px;height:56px;color:var(--fm-cyan)">
        <path d="M16.5 9.4 7.55 4.24"/>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5"/>
        <path d="M12 22V12"/>
      </svg>
      <h1 style="font-size:1.8rem;font-weight:700;color:var(--fm-navy)">
        Catálogo
      </h1>
      <p style="color:var(--fm-text-muted);text-align:center;max-width:420px">
        Aquí se renderizarán:<br/>
        catálogo con filtros, buscador y ficha de producto.
      </p>
      <a routerLink="/home"
         style="color:var(--fm-blue);font-weight:600;text-decoration:none">
        ← Volver al inicio
      </a>
    </div>
  `,
})
export class CatalogoComponent {}
