import { DynamicParser } from './DynamicRenderer.utils'
import { ValidationUtils } from './ValidationUtils'
import type { SchemaField } from '@/lib/types/module'

/**
 * Clase utilitaria para la manipulación y obtención de valores del modelo de datos.
 */
export class ModelUtils {
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
    return `field-${index}-${DynamicParser.getProp(item)}-${item.type}`
  }

  /**
   * Obtiene el valor real de un campo, manejando casos de datos complejos y arrays vacíos.
   */
  static getFieldValue(item: any, model: any) {
    const prop = DynamicParser.getProp(item)
    const val = model[prop]
    const isEmpty = val === undefined || val === null || (Array.isArray(val) ? val.length === 0 : (typeof val === 'string' && val === ''))

    if (isEmpty && DynamicParser.isComplex(item.type || '')) {
      return model
    }
    return val
  }

  /**
   * Actualiza un valor en el modelo y ejecuta las validaciones asociadas.
   */
  static updateModel(
    prop: string, 
    val: any, 
    model: any, 
    schema: any[], 
    validationErrors: Record<string, any>, 
    backendErrors: Record<string, any>,
    criticalConfigError?: { value: string | null }
  ): void {
    model[prop] = val
    if (backendErrors[prop]) delete backendErrors[prop]
    
    const item = schema.find((f: any) => DynamicParser.getProp(f) === prop)
    if (item) {
      ValidationUtils.runValidation(validationErrors, model, prop, val, item)
      
      // Detección inmediata de error crítico de configuración
      if (criticalConfigError && validationErrors[prop]?.message?.includes('[ERROR DE CONFIGURACIÓN]')) {
        criticalConfigError.value = validationErrors[prop].message
      }
    }
  }
}
