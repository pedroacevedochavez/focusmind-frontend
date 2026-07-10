import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — acceso.component.ts
//  HU-07: Módulo de Autenticación — Login con Reactive Forms (Sprint 2).
//  HU-19: AuthService.login() ahora es una llamada HTTP real (POST
//  /api/auth/login) — se suscribe al Observable en vez de leer un
//  boolean síncrono; al autenticar exitosamente, AuthService ya dejó
//  el JWT en localStorage y se redirige al Dashboard.
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
    this.authService.login(email, password).subscribe(autenticado => {
      if (!autenticado) {
        this.credencialesInvalidas = true;
        return;
      }

      this.credencialesInvalidas = false;
      this.router.navigate(['/dashboard']);
    });
  }
}