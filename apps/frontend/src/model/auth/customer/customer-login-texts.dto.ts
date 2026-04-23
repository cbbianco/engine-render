/**
 * DTO: texto que envía el servicio customer en POST /api/v1/customer.
 * Todos los campos son opcionales; el frontend usa valores por defecto en inglés para los no enviados.
 *
 * Ejemplo de payload (dominio en lugar de email):
 * "loginTexts": {
 *   "title": "Iniciar Sesión",
 *   "subtitle": "Introduzca sus credenciales",
 *   "domainLabel": "Dominio",
 *   "passwordLabel": "Clave",
 *   "domainPlaceholder": "Ej. midominio.com",
 *   "passwordPlaceholder": "Introduzca su clave",
 *   "errors": { "domainRequired": "...", "domainNoHttps": "..." }
 * }
 */
export interface CustomerLoginTextsDto {
  title?: string
  subtitle?: string
  domainLabel?: string
  passwordLabel?: string
  domainPlaceholder?: string
  passwordPlaceholder?: string
  submitButton?: string
  loadingButton?: string
  noRoutes?: string
  errors?: {
    domainRequired?: string
    domainNoSpaces?: string
    domainNoHttps?: string
    domainInvalidFormat?: string
    passwordRequired?: string
    passwordNoSpaces?: string
  }
  modal?: {
    internalErrorTitle?: string
    internalErrorMessage?: string
    userNotFoundTitle?: string
    userNotFoundMessage?: string
    badRequestTitle?: string
    badRequestMessage?: string
    genericTitle?: string
    genericMessage?: string
  }
}
