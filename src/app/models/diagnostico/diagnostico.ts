import { ObjetivoCognitivo } from '../producto/producto';

// Historial (GET /api/diagnosticos, HU-16). HU-19: ya NO incluye alergias/recomendacionesIds
// — DiagnosticoListItemResponseDto (backend) no las expone; solo un futuro
// GET /api/diagnosticos/:id (no construido en HU-16, ver notas de esa historia) las traería.
// Nada en el Frontend las necesitaba ya fuera de la vista de resultado inmediato del Quiz
// (ver DiagnosticoResultado más abajo).
export interface Diagnostico {
  fecha: string;
  nivelEstres: number;
  calidadSueno: number;
  objetivoPrincipal: ObjetivoCognitivo;
  horasConcentracion: number;
  condicionMedica: string;
}

/** Producto recomendado por el motor de recomendación del backend (forma slim, HU-16). */
export interface ProductoRecomendado {
  id: number;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string | null;
  stock: number;
}

// Resultado de POST /api/diagnosticos (HU-16) — `persistido` indica si el backend lo guardó
// en RDS (usuario autenticado) o si se calculó 100% en memoria (visitante anónimo). HU-19:
// GET /api/diagnosticos/ultimo devuelve exactamente esta misma forma (persistido siempre
// true), así que también se reutiliza para el panel "Mis Recomendaciones" del Dashboard.
export interface DiagnosticoResultado {
  fecha: string;
  nivelEstres: number;
  calidadSueno: number;
  objetivoPrincipal: ObjetivoCognitivo;
  horasConcentracion: number;
  condicionMedica: string;
  alergias: string[];
  recomendaciones: ProductoRecomendado[];
  persistido: boolean;
}

// Entrada del formulario del Quiz (Pasos 1-3) que DiagnosticoService.procesar() traduce al
// DiagnosticoCrearRequestDto del backend (idObjetivo/alergiaIds resueltos vía CatalogoService).
export interface DiagnosticoEntrada {
  nivelEstres: number;
  calidadSueno: number;
  objetivoPrincipal: ObjetivoCognitivo;
  horasConcentracion: number;
  alergias: string[];
  condicionMedica: string;
}
