import { AUTH_TOKEN_KEY, AUTH_ROUTES_KEY, AUTH_DOMAIN_KEY, AUTH_USERNAME_KEY } from '../keys'

/**
 * Persiste los datos básicos de la sesión en el SESSION storage.
 * Esto asegura el aislamiento entre pestañas (multitenancy).
 */
export function persistSession(
  token: string,
  routes: unknown,
  domain?: string,
  userName?: string
): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  sessionStorage.setItem(AUTH_ROUTES_KEY, JSON.stringify(routes))
  if (domain != null && domain !== '') {
    sessionStorage.setItem(AUTH_DOMAIN_KEY, domain)
  }
  if (userName != null && userName !== '') {
    sessionStorage.setItem(AUTH_USERNAME_KEY, userName)
  }
}

/**
 * Carga los datos de sesión desde el SESSION storage.
 */
export function loadSession(): {
  token: string | null
  routesStr: string | null
  domain: string | null
  userName: string | null
} {
  return {
    token: sessionStorage.getItem(AUTH_TOKEN_KEY),
    routesStr: sessionStorage.getItem(AUTH_ROUTES_KEY),
    domain: sessionStorage.getItem(AUTH_DOMAIN_KEY),
    userName: sessionStorage.getItem(AUTH_USERNAME_KEY)
  }
}

/**
 * Limpia los datos de sesión del SESSION storage.
 */
export function clearSession(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_ROUTES_KEY)
  sessionStorage.removeItem(AUTH_DOMAIN_KEY)
  sessionStorage.removeItem(AUTH_USERNAME_KEY)
}
