// HU-19: entorno de desarrollo local. apuntamos a http (no https) para evitar la fricción de
// confiar el certificado de desarrollo de ASP.NET Core en el navegador durante la integración
// local — el puerto 5064 es el perfil "http" de src/FocusMind.API/Properties/launchSettings.json
// en el backend. No se configura ningún entorno de nube todavía (ver environment.prod.ts).
export const environment = {
  production: false,
  apiUrl: 'http://focusmind-api-env.eba-82ndz2af.us-east-1.elasticbeanstalk.com/api/',
};
