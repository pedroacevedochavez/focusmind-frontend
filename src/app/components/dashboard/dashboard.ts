import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — dashboard.component.ts
//  Estructura estática (dummy) "En construcción" — Sprint 1:
//  panel privado de usuario, historial de tests y recomendaciones.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl:    './dashboard.scss',
})
export class DashboardComponent {}
