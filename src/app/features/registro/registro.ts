import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — registro.component.ts
//  HU-07: Módulo de Autenticación — Registro de cuenta con Reactive Forms.
//  HU-19: AuthService.registrar() ahora es una llamada HTTP real (POST
//  /api/auth/register) — se suscribe al Observable en vez de leer un
//  boolean síncrono. El mínimo de password se subió de 6 a 8 caracteres
//  para alinearse con RegistroRequestDto.Password ([MinLength(8)]) del
//  backend (HU-14): antes, un password de 6-7 caracteres pasaba la
//  validación del Frontend pero el backend lo rechazaba con 400.
// ══════════════════════════════════════════════════════════════════
function passwordsCoincidenValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmarPassword = control.get('confirmarPassword')?.value;
  return password === confirmarPassword ? null : { passwordsNoCoinciden: true };
}

@Component({
  selector:    'app-registro',
  standalone:  true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl:    './registro.css',
})
export class RegistroComponent {

  mostrarPassword = false;
  registroFallido = false;

  readonly formulario: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.formulario = this.fb.group(
      {
        nombre:           ['', [Validators.required, Validators.minLength(3)]],
        email:            ['', [Validators.required, Validators.email]],
        password:         ['', [Validators.required, Validators.minLength(8)]],
        confirmarPassword: ['', [Validators.required]],
      },
      { validators: passwordsCoincidenValidator },
    );
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Solo marca error si el campo fue tocado (evita errores antes de interactuar).
  campoInvalido(nombre: string): boolean {
    const control = this.formulario.get(nombre);
    return !!control && control.invalid && control.touched;
  }

  passwordsNoCoinciden(): boolean {
    const confirmar = this.formulario.get('confirmarPassword');
    return this.formulario.hasError('passwordsNoCoinciden') && !!confirmar?.touched;
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { nombre, email, password } = this.formulario.value;
    this.authService.registrar(nombre, email, password).subscribe(registrado => {
      if (!registrado) {
        this.registroFallido = true;
        return;
      }

      this.registroFallido = false;
      this.router.navigate(['/dashboard']);
    });
  }
}
