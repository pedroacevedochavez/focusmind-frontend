import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — acceso.component.ts
//  US-07: Autenticación y Control de Acceso de Usuarios (Sprint 2).
//  Reactive Forms con validación síncrona; al autenticar exitosamente
//  invoca AuthService.login(), que crea la cookie de sesión (Secure,
//  SameSite=Strict) y redirige al Dashboard (/dashboard).
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-acceso',
  standalone:  true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './acceso.html',
  styleUrl:    './acceso.css',
})
export class AccesoComponent {

  mostrarPassword = false;
  credencialesInvalidas = false;

  readonly formulario: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.formulario = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Solo marca error si el campo fue tocado (evita errores antes de interactuar).
  campoInvalido(nombre: string): boolean {
    const control = this.formulario.get(nombre);
    return !!control && control.invalid && control.touched;
  }

  ingresar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { email, password } = this.formulario.value;
    const autenticado = this.authService.login(email, password);

    if (!autenticado) {
      this.credencialesInvalidas = true;
      return;
    }

    this.credencialesInvalidas = false;
    this.router.navigate(['/dashboard']);
  }
}