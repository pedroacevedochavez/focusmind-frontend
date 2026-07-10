// Perfil cognitivo calculado a partir del diagnóstico más reciente del usuario (HU-10, Dashboard).
// HU-19: se retiró de Usuario. El backend real lo expone en un endpoint aparte
// (GET /api/diagnosticos/ultimo, ver DiagnosticoService.obtenerPerfilCognitivo) porque es un
// dato derivado de TM_DIAGNOSTICO, no una columna de TM_USUARIO — nunca estuvo embebido en la
// respuesta de /api/auth/login ni /api/auth/register.
export interface PerfilCognitivo {
  nivelEstres: number;
  calidadSueno: number;
  objetivoPrincipal: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}
