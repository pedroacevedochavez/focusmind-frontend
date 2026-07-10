import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, shareReplay, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

// Forma de FocusMind.DTO.Responses.CategoriaResponseDto / ObjetivoResponseDto / AlergenoResponseDto.
export interface CatalogoItemDto {
  idCategoria?: number;
  idObjetivo?: number;
  idAlergeno?: number;
  codigo?: string;
  nombre: string;
}

export interface Catalogos {
  categorias: CatalogoItemDto[];
  objetivos: CatalogoItemDto[];
  alergenos: CatalogoItemDto[];
}

// ══════════════════════════════════════════════════════════════════
//  HU-19: único punto de resolución slug/nombre <-> id contra los
//  catálogos reales del backend (GET /api/categorias, /api/objetivos,
//  /api/alergenos — HU-15/HU-16, expuestos recién en esta historia).
//  Usado por ProductoService (categoria/objetivo del catálogo) y
//  DiagnosticoService (objetivo/alergias del Quiz). Cacheado con
//  shareReplay: un solo round-trip por carga de la app, sin importar
//  cuántos servicios se suscriban a catalogos$.
//
//  Diagnóstico de "Cargando..." infinito en el detalle de producto: si
//  cualquiera de las 3 llamadas quedaba pending (sin error, sin
//  completar), forkJoin nunca emitía y, con shareReplay(1) a secas, ese
//  estado colgado quedaba cacheado para siempre — todo consumidor
//  futuro de catalogos$ en la misma pestaña heredaba el cuelgue en
//  silencio (una request pending no loguea nada en consola). Fix:
//  - timeout(15s): fuerza que una request colgada eventualmente falle
//    en vez de quedar pending para siempre.
//  - shareReplay({ refCount: true }): al fallar, todos los suscriptores
//    activos se desuscriben (RxJS termina la suscripción en error) →
//    refCount cae a 0 → el multicast se descarta → la SIGUIENTE
//    suscripción dispara un forkJoin nuevo en vez de repetir el mismo
//    error/cuelgue cacheado para siempre. Con shareReplay(1) a secas
//    (bufferSize sin config, refCount:false implícito) esto no pasaba:
//    el resultado (incluido un error) quedaba fijo de por vida.
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);

  readonly catalogos$: Observable<Catalogos> = forkJoin({
    categorias: this.http.get<CatalogoItemDto[]>(`${environment.apiUrl}/categorias`),
    objetivos: this.http.get<CatalogoItemDto[]>(`${environment.apiUrl}/objetivos`),
    alergenos: this.http.get<CatalogoItemDto[]>(`${environment.apiUrl}/alergenos`),
  }).pipe(
    timeout(15000),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
