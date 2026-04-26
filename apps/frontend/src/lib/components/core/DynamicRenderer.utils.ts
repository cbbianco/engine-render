import type { SchemaField } from '@/lib/types/module'

/**
 * Clase de utilidades estáticas para el procesamiento y parseo del DynamicRenderer.
 * Centraliza la lógica de estilos, validación y resolución de tokens.
 */
export class DynamicParser {
  /**
   * Calcula el estilo de columna para el grid (12 columnas).
   */
  static columnStyle(item: SchemaField): { gridColumn: string } {
    const col = item.column ?? 'col-12'
    const match = col.match(/^col-(\d+)$/)
    const num = match ? parseInt(match[1] ?? '12', 10) : 12
    const span = Math.min(12, Math.max(1, Number.isNaN(num) ? 12 : num))
    return { gridColumn: `span ${span}` }
  }

  /**
   * Devuelve las clases de alineación flex basadas en la configuración del ítem.
   */
  static alignClass(item: SchemaField): string {
    const align = item.align
    if (!align || align === 'stretch') return ''
    
    const map: Record<string, string> = {
      start: 'flex justify-start items-start',
      center: 'flex justify-center items-center',
      end: 'flex justify-end items-end',
      baseline: 'flex items-baseline'
    }
    return (align in map ? map[align] : '') as string
  }

  /**
   * Obtiene el nombre de la propiedad del campo (soporta 'property' y 'propperty').
   */
  static getProp(item: SchemaField): string {
    const p = item.property || (item as any).propperty || ''
    return p.trim()
  }

  /**
   * Identifica si un componente es de tipo botón.
   */
  static isButton(item: SchemaField): boolean {
    return item.type === 'button'
  }

  /**
   * Identifica si un componente es un separador.
   */
  static isSeparator(item: SchemaField): boolean {
    return (item as any).separator === true
  }

  /**
   * Patrones de validación por defecto para reglas comunes.
   */
  private static readonly DEFAULT_PATTERNS: Record<string, { pattern: string; message: string }> = {
    password: { 
      pattern: "^(?=.*[A-Z])(?=.*[0-9]).{8,255}$", 
      message: "Mínimo 8 caracteres, una mayúscula y un número" 
    },
    userName: { 
      pattern: "^[a-zA-Z0-9._]{4,20}$", 
      message: "4-20 caracteres, alfanumérico, punto o guión bajo" 
    },
    nombre: { 
      pattern: "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{2,50}$", 
      message: "Nombre no válido (2-50 caracteres)" 
    },
    default: {
      pattern: "^.{1,255}$",
      message: "Este campo es requerido"
    }
  }

  /**
   * Tipos que no representan datos en el modelo.
   */
  private static readonly NON_DATA_TYPES = ['button', 'hr', 'title', 'separator', 'sep']

  /**
   * Determina si el campo debe ser incluido en el modelo de datos.
   */
  static isDataField(item: SchemaField): boolean {
    const type = (item.type || '').toLowerCase().trim()
    return !this.NON_DATA_TYPES.includes(type)
  }

  /**
   * Normaliza llaves que vienen escapadas o en formato array desde el JSON.
   */
  static normalizeKey(key: unknown): string {
    if (typeof key === 'string') {
      try {
        const parsed = JSON.parse(key) as unknown
        if (Array.isArray(parsed) && parsed[0] != null) return String(parsed[0])
      } catch {
        // no es JSON, devolver tal cual
      }
      return key
    }
    if (Array.isArray(key) && key[0] != null) return String(key[0])
    return String(key)
  }

  /**
   * Genera una llave única para el renderizado de Vue.
   */
  static fieldKey(item: SchemaField, index: number): string {
    return `field-${index}-${this.getProp(item)}-${item.type}`
  }

  /**
   * Crea un modelo de datos normalizado a partir de la configuración inicial.
   */
  static normalizedModelFromConfig(config: any): Record<string, unknown> {
    const base = (config?.bodyModel ?? config?.model ?? {}) as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const rawKey of Object.keys(base)) {
      const key = this.normalizeKey(rawKey)
      out[key] = base[rawKey]
    }
    return out
  }

  /**
   * Genera un setter para referencias de componentes.
   */
  static getRefSetter(fieldRefs: Map<string, unknown>, item: SchemaField, index: number) {
    return (el: unknown) => {
      if (el) fieldRefs.set(this.fieldKey(item, index), el)
    }
  }

  /**
   * Ejecuta la validación lógica de un campo.
   */
  static runValidation(
    validationErrors: Record<string, { invalid: boolean; message?: string }>,
    model: Record<string, unknown>,
    prop: string,
    value: unknown,
    item: SchemaField
  ): boolean {
    if (!item) return true
    const validation = item.validation
    const rule = validation?.rule || 'default'
    const defaultRule = this.DEFAULT_PATTERNS[rule] || this.DEFAULT_PATTERNS.default
    
    const pattern = validation?.pattern || defaultRule.pattern
    let message = validation?.message || defaultRule.message

    if (item.visible === false || item.readonly === true) {
      validationErrors[prop] = { invalid: false }
      return true
    }
    if (!validation?.pattern && !(item as any).match) {
      validationErrors[prop] = { invalid: false }
      return true
    }

    try {
      let invalid = false
      let finalMessage = message

      // 1. Validación de coincidencia (match)
      const matchProp = (item as any).match
      if (matchProp) {
        const hasMatchProp = matchProp in model && model[matchProp] !== undefined
        if (hasMatchProp && value !== model[matchProp]) {
          invalid = true
          finalMessage = 'Las contraseñas no coinciden'
        }
      }

      // 2. Validación de Patrón y Requerido
      if (!invalid && pattern) {
        const str = (value !== undefined && value !== null) ? String(value) : ''
        
        // Si es requerido y está vacío, error inmediato
        if ((item as any).required && !str) {
          invalid = true
          finalMessage = 'Este campo es obligatorio'
        } else if (pattern && str && !(new RegExp(pattern)).test(str)) {
          // Si tiene contenido pero no cumple el patrón, error de formato
          invalid = true
          // finalMessage ya tiene el mensaje de la regla por defecto o del item
        }
      }

      validationErrors[prop] = {
        invalid,
        message: invalid ? (finalMessage || 'Valor no válido') : undefined
      }
      return !invalid
    } catch (e) {
      console.error('[runValidation] Error:', e)
      validationErrors[prop] = { invalid: false }
      return true
    }
  }

  /**
   * Resuelve placeholders tipo {id} usando un mapa de datos.
   */
  static resolveTemplate(tpl: unknown, data: Record<string, any>): string {
    if (!tpl || typeof tpl !== 'string') return String(tpl || '')
    return tpl.replace(/\{(\w+)\}/g, (_, k) => (data[k] != null ? String(data[k]) : `{${k}}`))
  }

  /**
   * Resuelve endpoints manejando tokens de sistema y de modelo.
   */
  static resolveEndpointUri(endpoint: any, curModel: Record<string, any>): string {
    if (!endpoint) return ''
    let uri = typeof endpoint === 'string' ? endpoint : (endpoint.uri || endpoint.endpoint || '')
    if (!uri) return ''

    if (typeof endpoint === 'object') {
      const backend = (endpoint.backend || '').trim()
      const endpointPath = (endpoint.endpoint || '').trim()

      if (uri.includes('{backend}')) {
        const cleanBack = backend.endsWith('/') ? backend.slice(0, -1) : backend
        uri = uri.replace(/\{backend\}/g, cleanBack)
      }
      if (uri.includes('{endpoint}')) {
        const cleanEnd = endpointPath.startsWith('/') ? endpointPath.substring(1) : endpointPath
        uri = uri.replace(/\{endpoint\}/g, cleanEnd)
      }
    }

    if (!uri.startsWith('http') && !uri.startsWith('{')) {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
      const cleanUri = uri.startsWith('/') ? uri : '/' + uri
      uri = cleanBase + cleanUri
    }

    return uri.replace(/\{(\w+)\}/g, (_: string, k: string) => {
      const v = curModel[k]
      return v != null ? String(v) : ''
    })
  }

  /**
   * Determina si el esquema representa un Dashboard.
   */
  static isDashboard(schema: SchemaField[]): boolean {
    if (!schema || !schema.length) return false
    const dashboardTypes = ['card-stats', 'chart-bar', 'chart-line', 'chart-pie', 'table-simple']
    return schema.some((item: any) => {
      const type = (item.type || '').split(':').pop()?.toLowerCase().trim() || ''
      return dashboardTypes.includes(type)
    })
  }

  /**
   * Verifica si el componente requiere hidratación premium (modelo completo).
   */
  static isComplex(type: string): boolean {
    const t = (type || '').toLowerCase()
    return t.includes('list-invoices') || t.includes('premium') || t === 'table' || t === 'data-table'
  }
}
