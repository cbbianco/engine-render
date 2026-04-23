/**
 * Modelo de dominio: textos de la pantalla de login.
 * Origen: servicio customer (loginTexts) o valores por defecto en inglés.
 *
 * SOLID:
 * - S: única responsabilidad = forma completa, valores por defecto y regla de merge.
 * - El store solo asigna estado; no conoce la estructura de errors/modal.
 * - El DTO del API (CustomerLoginTextsDto) vive en model/auth/customer.
 */

export interface LoginTextsErrors {
  domainRequired: string
  domainNoSpaces: string
  domainNoHttps: string
  domainInvalidFormat: string
  passwordRequired: string
  passwordNoSpaces: string
}

export interface LoginTextsModal {
  internalErrorTitle: string
  internalErrorMessage: string
  userNotFoundTitle: string
  userNotFoundMessage: string
  badRequestTitle: string
  badRequestMessage: string
  genericTitle: string
  genericMessage: string
}

export interface LoginTexts {
  title: string
  subtitle: string
  domainLabel: string
  passwordLabel: string
  domainPlaceholder: string
  passwordPlaceholder: string
  submitButton: string
  loadingButton: string
  noRoutes: string
  errors: LoginTextsErrors
  modal: LoginTextsModal
}

/** Valores por defecto en inglés cuando el backend no envía loginTexts. */
export const DEFAULT_LOGIN_TEXTS: LoginTexts = {
  title: 'Login',
  subtitle: 'Please enter your credentials.',
  domainLabel: 'Domain',
  passwordLabel: 'Password',
  domainPlaceholder: 'e.g. mydomain.com',
  passwordPlaceholder: 'Enter your password',
  submitButton: 'Sign In',
  loadingButton: 'Logging in...',
  noRoutes: 'No routes assigned to this user.',
  errors: {
    domainRequired: 'Domain is required',
    domainNoSpaces: 'Domain must not contain spaces',
    domainNoHttps: 'Do not include https:// or http://. Use only the domain (e.g. mydomain.com)',
    domainInvalidFormat: 'Invalid domain format',
    passwordRequired: 'Password is required',
    passwordNoSpaces: 'Password must not contain spaces'
  },
  modal: {
    internalErrorTitle: 'Internal Error',
    internalErrorMessage: 'Internal error. Please contact the administrator.',
    userNotFoundTitle: 'User Not Found',
    userNotFoundMessage: 'We could not find the user.',
    badRequestTitle: 'Bad Request',
    badRequestMessage: 'Invalid credentials or request.',
    genericTitle: 'Error',
    genericMessage: 'An error occurred. Please try again.'
  }
}

/**
 * Fusiona un objeto parcial (p. ej. del servicio customer) con los valores por defecto.
 * Cualquier clave no enviada por el backend se carga en inglés por defecto.
 */
export function mergeLoginTexts(partial?: Partial<LoginTexts> | null): LoginTexts {
  if (partial == null || typeof partial !== 'object') {
    return { ...DEFAULT_LOGIN_TEXTS }
  }
  const p = partial as Partial<LoginTexts>
  return {
    ...DEFAULT_LOGIN_TEXTS,
    ...p,
    errors: { ...DEFAULT_LOGIN_TEXTS.errors, ...p.errors },
    modal: { ...DEFAULT_LOGIN_TEXTS.modal, ...p.modal }
  }
}
