import { AUTH_LOGO_KEY } from '../keys'

/**
 * Persiste la URL del logo del cliente en el local storage.
 */
export function persistLogo(logo: string): void {
  localStorage.setItem(AUTH_LOGO_KEY, logo)
}

/**
 * Carga la URL del logo cargado previamente.
 */
export function loadLogo(): string | null {
  return localStorage.getItem(AUTH_LOGO_KEY)
}

/**
 * Borra el logo guardado.
 */
export function clearLogo(): void {
  localStorage.removeItem(AUTH_LOGO_KEY)
}
