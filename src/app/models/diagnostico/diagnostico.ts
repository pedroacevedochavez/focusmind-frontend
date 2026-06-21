import { ObjetivoCognitivo } from '../producto/producto';

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
