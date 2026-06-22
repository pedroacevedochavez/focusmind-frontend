import { ObjetivoCognitivo } from '../producto/producto';

// Resultado del Multi-Step Form de diagnóstico cognitivo (HU-09), persistido 30 días si hay sesión activa.
export interface Diagnostico {
  fecha: string;
  nivelEstres: number;
  calidadSueno: number;
  objetivoPrincipal: ObjetivoCognitivo;
  horasConcentracion: number;
  alergias: string[];
  condicionMedica: string;
  recomendacionesIds: number[]; // IDs de Producto, no los objetos completos
}
