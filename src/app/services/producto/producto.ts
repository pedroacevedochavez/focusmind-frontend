import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Catalogos, CatalogoService } from '../catalogo/catalogo';
import {
  Categoria,
  EntidadRegistro,
  ObjetivoCognitivo,
  Producto,
} from '../../models/producto/producto';

export interface FiltrosProducto {
  busqueda?: string;
  categoria?: Categoria | '';
  objetivo?: ObjetivoCognitivo | '';
  precioMax?: number;
}

// Forma de FocusMind.DTO.Responses.ProductoListItemResponseDto / ProductoDetalleResponseDto.
// Backend siempre envía "categoria"/"objetivo" como el NOMBRE legible (ej. "Memoria"), no el
// slug ('memoria') que usa el Frontend — de ahí el adaptador vía CatalogoService.
interface ProductoBackendDto {
  idProducto: number;
  nombre: string;
  marca: string;
  categoria: string;
  objetivo: string;
  precio: number;
  descripcion?: string;
  dosisRecomendada?: string;
  urlImagen: string | null;
  registroSanitario: string | null;
  entidadRegistro: string | null;
  stock: number;
  ingredientes?: string[];
  contraindicaciones?: string[];
  alergenos: string[];
}

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — producto.service.ts
//  HU-19: reemplaza PRODUCTOS_MOCK por llamadas HTTP reales a
//  FocusMind.API (HU-15). El Frontend sigue trabajando internamente
//  con los slugs tipados (Categoria/ObjetivoCognitivo) que ya usan el
//  panel de filtros (HU-04) y los diccionarios de etiquetas — por eso
//  este servicio resuelve, vía CatalogoService (catálogos reales,
//  cacheados), el slug -> id que espera el query string del backend, y
//  el nombre legible que devuelve el backend -> slug para reconstituir
//  un Producto tal como lo esperan el resto de componentes (catalogo,
//  detalle, dashboard).
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly catalogoService = inject(CatalogoService);
  private readonly endpoint = `${environment.apiUrl}/productos`;

  /** Catálogo completo, opcionalmente filtrado por criterios de búsqueda. */
  obtenerTodos(criterios?: FiltrosProducto): Observable<Producto[]> {
    return this.catalogoService.catalogos$.pipe(
      switchMap(catalogos => {
        const params = this.construirParametros(criterios, catalogos);

        return this.http
          .get<ProductoBackendDto[]>(this.endpoint, { params })
          .pipe(map(productos => productos.map(dto => this.mapearProducto(dto, catalogos))));
      }),
      // El catchError original solo cubría la llamada a /productos, no a catalogos$ — si
      // catalogos$ fallaba (o expiraba por el timeout agregado en CatalogoService), el error
      // salía sin capturar y el catálogo se quedaba sin renderizar. Envolver todo el pipe
      // asegura que cualquier falla (catálogos o productos) degrade a una lista vacía.
      catchError(() => of([])),
    );
  }

  obtenerPorId(id: number): Observable<Producto | undefined> {
    return this.catalogoService.catalogos$.pipe(
      switchMap(catalogos =>
        this.http.get<ProductoBackendDto>(`${this.endpoint}/${id}`).pipe(
          map(dto => this.mapearProducto(dto, catalogos)),
        ),
      ),
      // Mismo motivo que en obtenerTodos: cubre tanto la falla de catalogos$ como la del
      // producto puntual, en un solo lugar — antes solo la segunda estaba protegida.
      catchError(() => of(undefined)),
    );
  }

  /** Deriva el catálogo de alérgenos únicos del listado activo (mismo criterio que el mock original). */
  obtenerAlergenosUnicos(): Observable<string[]> {
    return this.obtenerTodos().pipe(
      map(productos => Array.from(new Set(productos.flatMap(producto => producto.alergenos)))),
    );
  }

  private construirParametros(criterios: FiltrosProducto | undefined, catalogos: Catalogos): HttpParams {
    let params = new HttpParams();

    if (!criterios) {
      return params;
    }

    const texto = (criterios.busqueda ?? '').trim();
    if (texto !== '') {
      params = params.set('q', texto);
    }

    if (criterios.categoria) {
      const idCategoria = catalogos.categorias.find(c => c.codigo === criterios.categoria)?.idCategoria;
      if (idCategoria !== undefined) {
        params = params.set('categoria', idCategoria);
      }
    }

    if (criterios.objetivo) {
      const idObjetivo = catalogos.objetivos.find(o => o.codigo === criterios.objetivo)?.idObjetivo;
      if (idObjetivo !== undefined) {
        params = params.set('objetivo', idObjetivo);
      }
    }

    if (criterios.precioMax !== undefined) {
      params = params.set('precioMax', criterios.precioMax);
    }

    return params;
  }

  private mapearProducto(dto: ProductoBackendDto, catalogos: Catalogos): Producto {
    // Fallback defensivo (no debería ocurrir: el nombre siempre viene del mismo catálogo que
    // ya resolvimos) — evita que un nombre inesperado rompa el tipado de union en runtime.
    const categoria =
      (catalogos.categorias.find(c => c.nombre === dto.categoria)?.codigo as Categoria | undefined) ?? 'memoria';
    const objetivo =
      (catalogos.objetivos.find(o => o.nombre === dto.objetivo)?.codigo as ObjetivoCognitivo | undefined) ??
      'mejorar-memoria';

    return {
      id: dto.idProducto,
      nombre: dto.nombre,
      marca: dto.marca,
      categoria,
      objetivo,
      precio: dto.precio,
      descripcion: dto.descripcion ?? '',
      ingredientes: dto.ingredientes ?? [],
      dosisRecomendada: dto.dosisRecomendada ?? '',
      contraindicaciones: dto.contraindicaciones ?? [],
      alergenos: dto.alergenos,
      imagen: dto.urlImagen ?? '',
      registroSanitario: dto.registroSanitario,
      entidadRegistro: dto.entidadRegistro as EntidadRegistro | null,
      stock: dto.stock,
    };
  }
}
