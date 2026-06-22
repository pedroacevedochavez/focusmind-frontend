# Informe de Disponibilidad en la Nube

La plataforma FocusMind se encuentra desplegada y operativa en **AWS Amplify**, mediante un pipeline de integración y despliegue continuo (CI/CD) que distribuye los artefactos de la aplicación a través de una red de distribución de contenidos (CDN), garantizando disponibilidad pública bajo conexión segura HTTPS.

## Información Técnica

| Campo | Detalle |
| --- | --- |
| **URL de Producción** | https://main.di5bbu5p2ozkb.amplifyapp.com/ |
| **Infraestructura** | AWS Amplify (CI/CD) |
| **Versión de Entorno** | Node.js v22.22.3 |
| **Estado** | Operativo (Producción) |

---

**Nota:** Cualquier cambio realizado en la rama `main` se sincroniza automáticamente con el pipeline de producción de AWS.
