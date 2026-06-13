export type Categoria =
  | 'memoria'
  | 'enfoque'
  | 'energia'
  | 'sueno'
  | 'estres'
  | 'animo';

export type ObjetivoCognitivo =
  | 'mejorar-memoria'
  | 'aumentar-concentracion'
  | 'reducir-estres'
  | 'mejorar-sueno'
  | 'aumentar-energia'
  | 'mejorar-animo';

export type EntidadRegistro = 'DIGESA' | 'DIGEMID';

export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  categoria: Categoria;
  objetivo: ObjetivoCognitivo;
  precio: number;
  descripcion: string;
  ingredientes: string[];
  dosisRecomendada: string;
  contraindicaciones: string[];
  alergenos: string[];
  /** Número de Registro Sanitario. null si el producto NO cuenta con RS vigente (ABET 2). */
  registroSanitario: string | null;
  /** Entidad emisora del registro. null si registroSanitario es null. */
  entidadRegistro: EntidadRegistro | null;
}

/** Etiquetas legibles para el selector de categoría del panel de filtros (US-04). */
export const CATEGORIA_LABELS: Record<Categoria, string> = {
  memoria: 'Memoria',
  enfoque: 'Enfoque',
  energia: 'Energía',
  sueno: 'Sueño',
  estres: 'Estrés',
  animo: 'Ánimo',
};

/** Etiquetas legibles para el selector de objetivo cognitivo del panel de filtros (US-04). */
export const OBJETIVO_LABELS: Record<ObjetivoCognitivo, string> = {
  'mejorar-memoria': 'Mejorar la memoria',
  'aumentar-concentracion': 'Aumentar la concentración',
  'reducir-estres': 'Reducir el estrés',
  'mejorar-sueno': 'Mejorar el sueño',
  'aumentar-energia': 'Aumentar la energía',
  'mejorar-animo': 'Mejorar el ánimo',
};