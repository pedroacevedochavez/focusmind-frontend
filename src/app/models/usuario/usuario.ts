export interface PerfilCognitivo {
  nivelEstres: number;
  calidadSueno: number;
  objetivoPrincipal: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  perfilCognitivo: PerfilCognitivo;
}