import { Component }   from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — detalle.component.ts
//  Estructura estática (dummy) "En construcción" — Sprint 2:
//  ficha técnica del producto. El layout ya prevé el cumplimiento del
//  criterio ABET 2 con los bloques de Registro Sanitario DIGESA/DIGEMID
//  y el banner de alérgenos (ver detalle.html).
// ══════════════════════════════════════════════════════════════════
@Component({
  selector:    'app-detalle',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './detalle.html',
  styleUrl:    './detalle.scss',
})
export class DetalleComponent {}