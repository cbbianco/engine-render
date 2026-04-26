import { DynamicParser } from './DynamicRenderer.utils'

/**
 * Clase utilitaria para la manipulación y obtención de valores del modelo de datos.
 */
export class ModelUtils {
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
      DynamicParser.runValidation(validationErrors, model, prop, val, item)
      
      // Detección inmediata de error crítico de configuración
      if (criticalConfigError && validationErrors[prop]?.message?.includes('[ERROR DE CONFIGURACIÓN]')) {
        criticalConfigError.value = validationErrors[prop].message
      }
    }
  }
}
