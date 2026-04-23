export const DEFAULT_THEME_CSS: AuthCss = {
  primary: 'var(--primary-color)',
  secondary: '#667085',
  errorColor: '#dc3545',
}

/**
 * Theme de estilos que provee el servicio customer al validar el dominio.
 * Se obtiene al consumir POST /api/v1/customer con { domain } y recibir
 * { access_token, css, logo }. css incluye primary, secondary, errorColor.
 */
export interface AuthCss {
  primary?: string
  secondary?: string
  /** Color de error: lo provee el servicio customer; se usa en bordes de input y mensajes. */
  errorColor?: string
  background?: string
  textTitle?: string
  textSubtitle?: string
}

/** Color de error del theme (viene del customer al autenticar dominio). Por defecto rojo. */
export function getErrorColor(css: AuthCss | undefined): string {
  if (!css) return DEFAULT_THEME_CSS.errorColor ?? 'red'
  return css.errorColor ?? DEFAULT_THEME_CSS.errorColor ?? 'red'
}

/** Aclara u oscurece un hex (percent > 0 aclara, < 0 oscurece). */
export function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const factor = 1 + percent / 100
  const r = Math.round(Math.max(0, Math.min(255, (num >> 16) * factor)))
  const g = Math.round(Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) * factor)))
  const b = Math.round(Math.max(0, Math.min(255, (num & 0x0000ff) * factor)))
  return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r},${g},${b},${alpha})`
}

/** Variables CSS del tema para inyectar en el DOM (login y área autenticada). primary = principal, secondary = secundario, errorColor = errores. */
export function getThemeCssVars(css: AuthCss | undefined): Record<string, string> {
  const primary = css?.primary ?? DEFAULT_THEME_CSS.primary ?? 'var(--primary-color)'
  const secondary = css?.secondary ?? DEFAULT_THEME_CSS.secondary ?? '#667085'
  const errorColor = getErrorColor(css)
  const isHex = /^#[0-9A-Fa-f]{3,8}$/.test(primary)
  const primaryHover = isHex ? adjustBrightness(primary, -20) : 'rgba(0,0,0,0.1)'
  const primaryBgLight = isHex ? hexToRgba(primary, 0.12) : 'rgba(0,0,0,0.06)'

  return {
    '--primary-color': primary,
    '--secondary-color': secondary,
    '--error-color': errorColor,
    '--primary-hover': primaryHover,
    '--primary-bg-light': primaryBgLight,
    '--bg-page': css?.background ?? '#f0f2f5',

    // Alises para compatibilidad con layout TailAdmin e interior de la app
    '--color-brand-50': primaryBgLight,
    '--color-brand-500': primary,
    '--color-brand-600': primaryHover,
    '--color-brand-native': primary
  }
}