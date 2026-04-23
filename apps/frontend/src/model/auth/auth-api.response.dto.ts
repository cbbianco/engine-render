import type { AuthCss } from './css/auth.css.dto'

/** Ruta devuelta por el API de auth (users/auth) */
export interface AuthRouteConfig {
  method: string
  path: string
  pathActive: number
}

/** Respuesta de POST /api/v1/users/auth */
export interface AuthApiResponse {
  access_token: string
  path?: AuthRouteConfig[]
  css?: AuthCss
  /** Alias de tema que algunos backends envían como colorCss */
  colorCss?: AuthCss
}
