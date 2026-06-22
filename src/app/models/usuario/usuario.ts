// Perfil cognitivo calculado a partir del diagnóstico más reciente del usuario (HU-10, Dashboard).
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