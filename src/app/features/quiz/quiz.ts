import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';
import { DiagnosticoService } from '../../services/diagnostico/diagnostico';
import { PRODUCTOS_MOCK } from '../../data/productos/productos';
import {
  ObjetivoCognitivo,
  OBJETIVO_LABELS,
  Producto,
} from '../../models/producto/producto';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — quiz.component.ts
//  Quiz de Diagnóstico Cognitivo — Multi-Step Form (Reactive Forms).
//
//  ACCESIBILIDAD: ruta 100% pública (sin canActivate en app.routes.ts).
//  El formulario se muestra siempre, esté o no autenticado el visitante.
//
//  COMPORTAMIENTO SEGÚN SESIÓN (cookie fm_sesion vía AuthService):
//   • Con sesión activa: al finalizar, el resultado se persiste en el
//     historial del usuario mediante DiagnosticoService (cookie de
//     30 días), visible luego en el Dashboard.
//   • Sin sesión activa: se muestra un banner invitando a iniciar
//     sesión; el cuestionario se completa igual y las recomendaciones
//     se calculan localmente, pero no se guardan en ningún perfil.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-quiz',
  standalone:  true,
  imports:     [RouterLink, ReactiveFormsModule],
  templateUrl: './quiz.html',
  styleUrl:    './quiz.css',
})
export class QuizComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly diagnosticoService = inject(DiagnosticoService);

  /** Estado de sesión leído de la cookie — controla el banner y la persistencia. */
  readonly sesionActiva = this.authService.sesionActiva;

  readonly objetivos: { value: ObjetivoCognitivo; label: string }[] =
    (Object.entries(OBJETIVO_LABELS) as [ObjetivoCognitivo, string][])
      .map(([value, label]) => ({ value, label }));

  /** Catálogo de alérgenos declarados en el repositorio Mock, para el Paso 3. */
  readonly alergenosDisponibles: string[] = Array.from(
    new Set(PRODUCTOS_MOCK.flatMap(producto => producto.alergenos)),
  );

  readonly formulario: FormGroup = this.fb.group({
    nivelEstres:        [null, [Validators.required, Validators.min(1), Validators.max(10)]],
    calidadSueno:       [null, [Validators.required, Validators.min(1), Validators.max(10)]],
    objetivoPrincipal:  ['', [Validators.required]],
    horasConcentracion: [null, [Validators.required, Validators.min(1), Validators.max(16)]],
    alergias:           [[] as string[]],
    condicionMedica:    [''],
  });

  /** Campos de Reactive Forms que pertenecen a cada paso del Wizard. */
  private readonly camposPorPaso: Record<number, string[]> = {
    1: ['nivelEstres', 'calidadSueno'],
    2: ['objetivoPrincipal', 'horasConcentracion'],
    3: ['alergias', 'condicionMedica'],
  };

  readonly pasoActual = signal(1);
  readonly completado = signal(false);
  readonly guardadoEnHistorial = signal(false);
  readonly recomendaciones = signal<Producto[]>([]);

  // Solo marca error si el campo fue tocado (evita errores antes de interactuar).
  campoInvalido(nombre: string): boolean {
    const control = this.formulario.get(nombre);
    return !!control && control.invalid && control.touched;
  }

  estaAlergiaSeleccionada(alergeno: string): boolean {
    const actuales: string[] = this.formulario.get('alergias')?.value ?? [];
    return actuales.includes(alergeno);
  }

  // Un solo FormControl<string[]> en vez de FormArray: más simple para chips on/off.
  toggleAlergia(alergeno: string): void {
    const control = this.formulario.get('alergias')!;
    const actuales: string[] = control.value ?? [];
    const nuevas = actuales.includes(alergeno)
      ? actuales.filter(item => item !== alergeno)
      : [...actuales, alergeno];
    control.setValue(nuevas);
  }

  /** Avanza de paso únicamente si los campos del paso actual son válidos. */
  avanzarPaso(): void {
    const campos = this.camposPorPaso[this.pasoActual()];
    campos.forEach(campo => this.formulario.get(campo)!.markAsTouched());

    const pasoValido = campos.every(campo => this.formulario.get(campo)!.valid);
    if (!pasoValido) {
      return;
    }

    if (this.pasoActual() < 3) {
      this.pasoActual.set(this.pasoActual() + 1);
    }
  }

  retrocederPaso(): void {
    if (this.pasoActual() > 1) {
      this.pasoActual.set(this.pasoActual() - 1);
    }
  }

  /**
   * Procesa las respuestas con el motor de recomendación local y, solo si
   * existe sesión activa, persiste el resultado en el historial del usuario.
   */
  finalizar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.value;
    const objetivo: ObjetivoCognitivo = valores.objetivoPrincipal;
    const alergiasSeleccionadas: string[] = valores.alergias ?? [];

    const recomendados = PRODUCTOS_MOCK
      .filter(producto => producto.objetivo === objetivo)
      .filter(producto => !producto.alergenos.some(alergeno => alergiasSeleccionadas.includes(alergeno)))
      .slice(0, 3);

    this.recomendaciones.set(recomendados);

    if (this.sesionActiva()) {
      this.diagnosticoService.registrar({
        fecha:              new Date().toISOString(),
        nivelEstres:        valores.nivelEstres,
        calidadSueno:       valores.calidadSueno,
        objetivoPrincipal:  objetivo,
        horasConcentracion: valores.horasConcentracion,
        alergias:           alergiasSeleccionadas,
        condicionMedica:    valores.condicionMedica ?? '',
        recomendacionesIds: recomendados.map(producto => producto.id),
      });
      this.guardadoEnHistorial.set(true);
    } else {
      this.guardadoEnHistorial.set(false);
    }

    this.completado.set(true);
  }

  reiniciar(): void {
    this.formulario.reset({ alergias: [], condicionMedica: '' });
    this.pasoActual.set(1);
    this.completado.set(false);
    this.guardadoEnHistorial.set(false);
    this.recomendaciones.set([]);
  }
}
