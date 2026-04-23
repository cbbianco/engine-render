import type { AuthCss } from '@/model/auth/css/auth.css.dto'
import { AUTH_CSS_KEY } from '../keys'

/**
 * Persiste la configuración CSS del tema en el local storage.
 */
export function persistThemeCss(css: AuthCss): void {
  localStorage.setItem(AUTH_CSS_KEY, JSON.stringify(css))
}

/**
 * Carga la configuración CSS del tema desde el local storage.
 */
export function loadThemeCss(): string | null {
  return localStorage.getItem(AUTH_CSS_KEY)
}
