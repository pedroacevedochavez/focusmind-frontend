import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Catalogos, CatalogoService } from '../catalogo/catalogo';
import { ObjetivoCognitivo } from '../../models/producto/producto';
import {
  Diagnostico,
  DiagnosticoEntrada,
  DiagnosticoResultado,
  ProductoRecomendado,
} from '../../models/diagnostico/diagnostico';

interface ProductoRecomendadoDto {
  idProducto: number;
  nombre: string;
  marca: string;
  precio: number;
  urlImagen: string | null;
  stock: number;
}

// Forma de FocusMind.DTO.Responses.DiagnosticoResponseDto (POST /api/diagnosticos).
interface DiagnosticoResponseDto {
  idDiagnostico: number | null;
  fecha: string;
  nivelEstres: number;
  calidadSueno: number;
  objetivo: string;
  horasConcentracion: number;
  condicionMedica: string | null;
  alergias: string[];
  recomendaciones: ProductoRecomendadoDto[];
  persistido: boolean;
}

// Forma de FocusMind.DTO.Responses.DiagnosticoListItemResponseDto (GET /api/diagnosticos).
interface DiagnosticoListItemDto {
  idDiagnostico: number;
  fecha: string;
  nivelEstres: number;
  calidadSueno: number;
  objetivo: string;
  horasConcentracion: number;
  condicionMedica: string | null;
}

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — diagnostico.service.ts
//  HU-19: reemplaza el registro en cookie por POST /api/diagnosticos
//  (HU-16). El motor de recomendación del backend corre SIEMPRE (con o
//  sin sesión); solo persiste en RDS si detecta un JWT válido — la
//  regla de "guardar o no" ya no vive en el Frontend, la decide el
//  backend (ver DiagnosticoResultado.persistido).
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class DiagnosticoService {
  private readonly http = inject(HttpClient);
  private readonly catalogoService = inject(CatalogoService);
  private readonly endpoint = `${environment.apiUrl}/diagnosticos`;

  private readonly _historial = signal<Diagnostico[]>([]);
  readonly historial = this._historial.asReadonly();

  /** Corre el Quiz contra el backend real. Funciona con o sin sesión activa (HU-16). */
  procesar(entrada: DiagnosticoEntrada): Observable<DiagnosticoResultado> {
    return this.catalogoService.catalogos$.pipe(
      switchMap(catalogos => {
        const idObjetivo = catalogos.objetivos.find(o => o.codigo === entrada.objetivoPrincipal)?.idObjetivo ?? 0;
        const alergiaIds = entrada.alergias
          .map(nombre => catalogos.alergenos.find(a => a.nombre === nombre)?.idAlergeno)
          .filter((id): id is number => id !== undefined);

        const body = {
          nivelEstres: entrada.nivelEstres,
          calidadSueno: entrada.calidadSueno,
          idObjetivo,
          horasConcentracion: entrada.horasConcentracion,
          condicionMedica: entrada.condicionMedica || null,
          alergiaIds,
        };

        return this.http
          .post<DiagnosticoResponseDto>(this.endpoint, body)
          .pipe(map(respuesta => this.mapearResultado(respuesta, catalogos)));
      }),
    );
  }

  /**
   * Último diagnóstico del usuario autenticado, con perfil cognitivo + alergias +
   * recomendaciones (GET /api/diagnosticos/ultimo, HU-19). null si todavía no tiene ningún
   * diagnóstico (404 del backend) — el llamador decide qué mostrar en ese caso (ver
   * DashboardComponent). Reutiliza DiagnosticoResultado: el backend devuelve exactamente la
   * misma forma que POST /api/diagnosticos (persistido siempre true aquí).
   */
  obtenerUltimo(): Observable<DiagnosticoResultado | null> {
    return this.catalogoService.catalogos$.pipe(
      switchMap(catalogos =>
        this.http.get<DiagnosticoResponseDto>(`${this.endpoint}/ultimo`).pipe(
          map(dto => this.mapearResultado(dto, catalogos)),
          catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 404) {
              return of(null);
            }
            throw error;
          }),
        ),
      ),
    );
  }

  /** Historial del usuario autenticado (GET /api/diagnosticos) — requiere sesión activa. */
  cargarHistorial(): void {
    this.catalogoService.catalogos$
      .pipe(
        switchMap(catalogos =>
          this.http
            .get<DiagnosticoListItemDto[]>(this.endpoint)
            .pipe(map(items => items.map(item => this.mapearHistorialItem(item, catalogos)))),
        ),
      )
      .subscribe(historial => this._historial.set(historial));
  }

  private mapearResultado(dto: DiagnosticoResponseDto, catalogos: Catalogos): DiagnosticoResultado {
    return {
      fecha: dto.fecha,
      nivelEstres: dto.nivelEstres,
      calidadSueno: dto.calidadSueno,
      objetivoPrincipal: this.resolverSlugObjetivo(dto.objetivo, catalogos),
      horasConcentracion: dto.horasConcentracion,
      condicionMedica: dto.condicionMedica ?? '',
      alergias: dto.alergias,
      recomendaciones: dto.recomendaciones.map(p => this.mapearRecomendado(p)),
      persistido: dto.persistido,
    };
  }

  private mapearHistorialItem(dto: DiagnosticoListItemDto, catalogos: Catalogos): Diagnostico {
    return {
      fecha: dto.fecha,
      nivelEstres: dto.nivelEstres,
      calidadSueno: dto.calidadSueno,
      objetivoPrincipal: this.resolverSlugObjetivo(dto.objetivo, catalogos),
      horasConcentracion: dto.horasConcentracion,
      condicionMedica: dto.condicionMedica ?? '',
    };
  }

  // Fallback defensivo (no debería ocurrir: el nombre siempre viene del mismo catálogo que ya
  // resolvimos) — evita que un nombre inesperado rompa el tipado de union en runtime.
  private resolverSlugObjetivo(nombre: string, catalogos: Catalogos): ObjetivoCognitivo {
    return (
      (catalogos.objetivos.find(o => o.nombre === nombre)?.codigo as ObjetivoCognitivo | undefined) ??
      'mejorar-memoria'
    );
  }

  private mapearRecomendado(dto: ProductoRecomendadoDto): ProductoRecomendado {
    return {
      id: dto.idProducto,
      nombre: dto.nombre,
      marca: dto.marca,
      precio: dto.precio,
      imagen: dto.urlImagen,
      stock: dto.stock,
    };
  }
}
