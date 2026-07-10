import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Producto,
  Categoria,
  ObjetivoCognitivo,
  CATEGORIA_LABELS,
  OBJETIVO_LABELS,
} from '../../models/producto/producto';
import { ProductoService } from '../../services/producto/producto';
import { CookieService } from '../../services/cookie/cookie';
import { FM_COOKIE_KEYS } from '../../constants/cookies/cookies';

interface FiltrosCatalogoPersistidos {
  busqueda: string;
  categoria: Categoria | '';
  objetivo: ObjetivoCognitivo | '';
  precioMax: number;
}

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — catalogo.ts
//  HU-03: Grid de productos + panel de filtros avanzados.
//  HU-04: Motor de filtrado dinámico mediante Two-Way Data Binding
//         ([(ngModel)]) delegado a ProductoService.obtenerTodos(criterios),
//         de forma que el filtrado pase a ser server-side (query params)
//         el día que el catálogo se sirva desde un backend real.
//  El estado de los 4 filtros se persiste en cookie (7 días) para
//  sobrevivir recargas, conforme al servicio transversal de Cookies
//  del informe FocusMind (sección 2.3.1).
// ══════════════════════════════════════════════════════════════════
@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoComponent implements OnInit {

  private readonly productoService = inject(ProductoService);
  private readonly cookieService = inject(CookieService);

  /** Catálogo completo (sin filtrar), usado para el contador "X de Y productos". */
  private readonly _productos = signal<Producto[]>([]);
  readonly productos = this._productos.asReadonly();

  /** Resultado vigente de aplicar los 4 filtros sobre el catálogo. */
  private readonly _productosFiltrados = signal<Producto[]>([]);
  readonly productosFiltrados = this._productosFiltrados.asReadonly();

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
  // Backing fields privados: cada setter público persiste en cookie y recalcula el resultado.
  private _busqueda = '';
  private _categoriaSeleccionada: Categoria | '' = '';
  private _objetivoSeleccionado: ObjetivoCognitivo | '' = '';
  private _precioMax = this.precioMaximoAbsoluto;

  /** Restaura el estado de los filtros desde la cookie y carga el catálogo. */
  ngOnInit(): void {
    const filtrosGuardados = this.cookieService.obtenerJSON<FiltrosCatalogoPersistidos>(
      FM_COOKIE_KEYS.FILTROS_CATALOGO,
    );

    if (filtrosGuardados) {
      this._busqueda = filtrosGuardados.busqueda ?? '';
      this._categoriaSeleccionada = filtrosGuardados.categoria ?? '';
      this._objetivoSeleccionado = filtrosGuardados.objetivo ?? '';
      this._precioMax = filtrosGuardados.precioMax ?? this.precioMaximoAbsoluto;
    }

    this.productoService.obtenerTodos().subscribe(productos => this._productos.set(productos));
    this.actualizarProductosFiltrados();
  }

  get busqueda(): string {
    return this._busqueda;
  }

  set busqueda(valor: string) {
    this._busqueda = valor;
    this.guardarFiltrosEnCookie();
    this.actualizarProductosFiltrados();
  }

  get categoriaSeleccionada(): Categoria | '' {
    return this._categoriaSeleccionada;
  }

  set categoriaSeleccionada(valor: Categoria | '') {
    this._categoriaSeleccionada = valor;
    this.guardarFiltrosEnCookie();
    this.actualizarProductosFiltrados();
  }

  get objetivoSeleccionado(): ObjetivoCognitivo | '' {
    return this._objetivoSeleccionado;
  }

  set objetivoSeleccionado(valor: ObjetivoCognitivo | '') {
    this._objetivoSeleccionado = valor;
    this.guardarFiltrosEnCookie();
    this.actualizarProductosFiltrados();
  }

  get precioMax(): number {
    return this._precioMax;
  }

  set precioMax(valor: number | string) {
    // input[type="range"] entrega string en el evento ngModelChange;
    // se normaliza a number para mantener comparaciones numéricas correctas.
    this._precioMax = Number(valor);
    this.guardarFiltrosEnCookie();
    this.actualizarProductosFiltrados();
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

  /** Recalcula el resultado filtrado delegando los criterios a ProductoService. */
  private actualizarProductosFiltrados(): void {
    this.productoService
      .obtenerTodos({
        busqueda: this._busqueda,
        categoria: this._categoriaSeleccionada,
        objetivo: this._objetivoSeleccionado,
        precioMax: this._precioMax,
      })
      .subscribe(productos => this._productosFiltrados.set(productos));
  }

  /** Persiste el estado completo de los 4 filtros en una cookie de 7 días. */
  private guardarFiltrosEnCookie(): void {
    const filtros: FiltrosCatalogoPersistidos = {
      busqueda: this._busqueda,
      categoria: this._categoriaSeleccionada,
      objetivo: this._objetivoSeleccionado,
      precioMax: this._precioMax,
    };
    this.cookieService.guardarJSON(FM_COOKIE_KEYS.FILTROS_CATALOGO, filtros, {
      diasExpiracion: 7,
    });
  }
}
