import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — quiz.component.ts
//  Estructura estática (dummy) "En construcción" — Sprint 2:
//  formulario reactivo multi-paso del Quiz de Diagnóstico Cognitivo.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:   'app-quiz',
  standalone: true,
  imports:    [RouterLink],
  template: `
    <div style="min-height:60vh;display:flex;flex-direction:column;
                align-items:center;justify-content:center;gap:16px;
                background:var(--fm-bg);padding:80px 24px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
           style="width:56px;height:56px;color:var(--fm-cyan)">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
      <h1 style="font-size:1.8rem;font-weight:700;color:var(--fm-navy)">
        Quiz Cognitivo
      </h1>
      <p style="color:var(--fm-text-muted);text-align:center;max-width:420px">
        Aquí se implementarán:<br/>
        formulario reactivo multi-paso con Angular Reactive Forms.
      </p>
      <a routerLink="/home"
         style="color:var(--fm-blue);font-weight:600;text-decoration:none">
        ← Volver al inicio
      </a>
    </div>
  `,
})
export class QuizComponent {}