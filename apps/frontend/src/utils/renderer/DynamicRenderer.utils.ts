import type { SchemaField } from '@/lib/types/module'
import { ModelUtils } from './ModelUtils'

/**
 * Clase de utilidades estáticas para el procesamiento y parseo del DynamicRenderer.
 * Centraliza la lógica de estilos, validación y resolución de tokens.
 */
export class DynamicParser {

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
   * Crea un modelo de datos normalizado a partir de la configuración inicial.
   */
  static normalizedModelFromConfig(config: any): Record<string, unknown> {
    const base = (config?.bodyModel ?? config?.model ?? {}) as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const rawKey of Object.keys(base)) {
      const key = ModelUtils.normalizeKey(rawKey)
      out[key] = base[rawKey]
    }
    return out
  }

  /**
   * Genera un setter para referencias de componentes.
   */
  static getRefSetter(fieldRefs: Map<string, unknown>, item: SchemaField, index: number) {
    return (el: unknown) => {
      if (el) fieldRefs.set(ModelUtils.fieldKey(item, index), el)
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
