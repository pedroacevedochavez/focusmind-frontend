import { Component }   from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Producto, CATEGORIA_LABELS } from '../../../models/producto.model/producto.model';
import { PRODUCTOS_MOCK } from '../../../data/productos.mock/productos.mock';

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
export class DetalleComponent {
  cargando = false;
  noEncontrado = false;
  id: string | null = null;
  producto?: Producto;

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.producto = PRODUCTOS_MOCK.find(p => p.id === Number(this.id));
    this.noEncontrado = !this.producto;
  }

  get categoriaLabel(): string {
    return this.producto ? CATEGORIA_LABELS[this.producto.categoria] : '';
  }

  get tieneRegistroSanitario(): boolean {
    return !!this.producto?.registroSanitario;
  }

  get tieneAlergenos(): boolean {
    return !!this.producto && this.producto.alergenos.length > 0;
  }
}