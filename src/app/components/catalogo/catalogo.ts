import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Producto,
  Categoria,
  ObjetivoCognitivo,
  CATEGORIA_LABELS,
  OBJETIVO_LABELS,
} from '../../models/producto.model/producto.model';
import { PRODUCTOS_MOCK } from '../../data/productos.mock/productos.mock';

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — catalogo.ts
//  US-03: Grilla de productos + panel de filtros avanzados.
//  US-04: Filtrado dinámico en memoria mediante Angular Data Binding
//         ([(ngModel)] + getter productosFiltrados()).
//  100% en memoria — sin peticiones HTTP. Mock: PRODUCTOS_MOCK.
// ══════════════════════════════════════════════════════════════════
@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class CatalogoComponent {

  /** Catálogo completo en memoria (Sprint 1: datos mockeados). */
  readonly productos: Producto[] = PRODUCTOS_MOCK;

  /** Opciones del selector de categoría, incluida la opción "Todas". */
  readonly categorias: { value: Categoria | ''; label: string }[] = [
    { value: '', label: 'Todas las categorías' },
    ...(Object.entries(CATEGORIA_LABELS) as [Categoria, string][])
      .map(([value, label]) => ({ value, label })),
  ];

  /** Opciones del selector de objetivo cognitivo, incluida la opción "Todos". */
  readonly objetivos: { value: ObjetivoCognitivo | ''; label: string }[] = [
    { value: '', label: 'Todos los objetivos' },
    ...(Object.entries(OBJETIVO_LABELS) as [ObjetivoCognitivo, string][])
      .map(([value, label]) => ({ value, label })),
  ];

  /** Límites del control deslizante de precio. */
  readonly precioMinimo = 0;
  readonly precioMaximoAbsoluto = 200;

  // ── Estado de los filtros — vinculados con [(ngModel)] ────────────
  busqueda = '';
  categoriaSeleccionada: Categoria | '' = '';
  objetivoSeleccionado: ObjetivoCognitivo | '' = '';

  /** Valor interno del slider de precio. Normalizado a número en el setter. */
  private _precioMax = this.precioMaximoAbsoluto;

  get precioMax(): number {
    return this._precioMax;
  }

  set precioMax(valor: number | string) {
    // input[type="range"] entrega string en el evento ngModelChange;
    // se normaliza a number para mantener comparaciones numéricas correctas.
    this._precioMax = Number(valor);
  }

  /**
   * Getter recalculado en cada ciclo de detección de cambios de Angular.
   * Aplica los 4 filtros de forma acumulativa (AND lógico).
   */
  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.productos.filter(producto => {
      const coincideTexto =
        texto === '' ||
        producto.nombre.toLowerCase().includes(texto) ||
        producto.marca.toLowerCase().includes(texto) ||
        producto.descripcion.toLowerCase().includes(texto) ||
        producto.ingredientes.some(ingrediente =>
          ingrediente.toLowerCase().includes(texto)
        );

      const coincideCategoria =
        this.categoriaSeleccionada === '' ||
        producto.categoria === this.categoriaSeleccionada;

      const coincideObjetivo =
        this.objetivoSeleccionado === '' ||
        producto.objetivo === this.objetivoSeleccionado;

      const coincidePrecio = producto.precio <= this.precioMax;

      return coincideTexto && coincideCategoria && coincideObjetivo && coincidePrecio;
    });
  }

  /** true si al menos un filtro tiene un valor distinto del valor por defecto. */
  get hayFiltrosActivos(): boolean {
    return (
      this.busqueda.trim() !== '' ||
      this.categoriaSeleccionada !== '' ||
      this.objetivoSeleccionado !== '' ||
      this.precioMax !== this.precioMaximoAbsoluto
    );
  }

  /** Restablece los cuatro controles del panel de filtros a sus valores por defecto. */
  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = '';
    this.objetivoSeleccionado = '';
    this.precioMax = this.precioMaximoAbsoluto;
  }

  obtenerLabelCategoria(categoria: Categoria | ''): string {
    return categoria ? CATEGORIA_LABELS[categoria] : '';
  }

  obtenerLabelObjetivo(objetivo: ObjetivoCognitivo | ''): string {
    return objetivo ? OBJETIVO_LABELS[objetivo] : '';
  }
}