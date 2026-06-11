// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — acceso.component.ts
//  Módulo de Autenticación | Standalone | Angular 22
//  Sprint 2: Validación de credenciales, sesiones y AuthGuards
//  Estado actual: estructura estática (dummy) "En construcción" —
//  formulario visual deshabilitado a la espera de Reactive Forms.
// ══════════════════════════════════════════════════════════════════
import { Component } from '@angular/core';
import { RouterLink }          from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';  

@Component({
  selector:    'app-acceso',
  standalone:  true,
  imports: [
    RouterLink,           // navegación interna (links al home, registro, etc.)
    ReactiveFormsModule,  // preparado para FormGroup / FormControl 
  ],
  templateUrl: './acceso.html',
  styleUrl:    './acceso.scss',
})
export class AccesoComponent {

  // ── Estado visual del campo contraseña (toggle show/hide) ───────
  // Se activará junto con la lógica de Reactive Forms
  mostrarPassword = false;

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }
}
