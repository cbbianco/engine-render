/**
 * Expansión semántica de opciones para selects.
 * Patrón <<TEMA>>: se reemplaza por una lista de opciones según el concepto.
 */

const FORM_HTML_OPTIONS = [
  'input',
  'select',
  'button',
  'checkbox',
  'radio',
  'textarea',
  'datepicker'
] as const

const SEMANTIC_MAP: Record<string, string[]> = {
  'FORM HTML': [...FORM_HTML_OPTIONS],
  FORM_HTML: [...FORM_HTML_OPTIONS],
  ESTADO: ['Activo', 'Inactivo', 'Pendiente'],
  PRIORIDAD: ['Alta', 'Media', 'Baja'],
  SEXO: ['Masculino', 'Femenino', 'Otro'],
  PAIS: ['España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Otro'],
  SI_NO: ['Sí', 'No']
}

/**
 * Detecta si una opción es un patrón <<...>>.
 */
export function isSemanticPattern(opt: any): boolean {
  if (typeof opt !== 'string') return false
  return /^<<\s*.+\s*>>$/.test(opt.trim())
}

/**
 * Extrae el tema del patrón <<TEMA>> (sin espacios extra).
 */
export function extractTheme(pattern: string): string {
  const match = pattern.trim().match(/^<<\s*(.+?)\s*>>$/)
  return match && match[1] != null ? match[1].trim().toUpperCase().replace(/\s+/g, ' ') : ''
}

/**
 * Expande una lista de opciones: reemplaza cada <<TEMA>> por las opciones del diccionario
 * o infiere opciones genéricas por el texto.
 */
export function expandOptions(options: any[]): any[] {
  if (!Array.isArray(options)) return []
  const result: any[] = []
  for (const opt of options) {
    if (typeof opt !== 'string' || !isSemanticPattern(opt)) {
      result.push(opt)
      continue
    }
    const theme = extractTheme(opt)
    const known = SEMANTIC_MAP[theme]
    if (known) {
      result.push(...known)
    } else {
      result.push(...inferOptionsFromTheme(theme))
    }
  }
  return result
}

/**
 * Infiere opciones lógicas a partir del texto del tema (semántica básica).
 */
function inferOptionsFromTheme(theme: string): string[] {
  const upper = theme.toUpperCase()
  if (upper.includes('LISTA') || upper.includes('OPCION')) {
    return ['Opción 1', 'Opción 2', 'Opción 3']
  }
  if (upper.includes('TIPO') || upper.includes('KIND')) {
    return ['Tipo A', 'Tipo B', 'Tipo C']
  }
  return [theme]
}
