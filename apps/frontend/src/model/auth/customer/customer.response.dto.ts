import type { AuthCss } from '../css/auth.css.dto'
import type { CustomerLoginTextsDto } from './customer-login-texts.dto'

export interface CustomerResponse {
  access_token: string
  logo?: string
  /** Tema del cliente (primary, secondary, errorColor). Se acepta también colorCss desde el API. */
  css?: AuthCss
  colorCss?: AuthCss
  /** Textos de la pantalla de login; opcional. Si no viene, se usan los por defecto (inglés). */
  loginTexts?: CustomerLoginTextsDto
  /** Llave pública para cifrado RSA asimétrico. */
  serverPublicKey?: string
}