import type { Ref } from 'vue'
import { DynamicParser } from '../DynamicRenderer.utils'

/**
 * Clase utilitaria para la gestión y manipulación de estados de formulario.
 */
export class FormUtils {
  /**
   * Resetea el formulario completo, incluyendo errores y la bandera de envío.
   */
  static resetForm(
    model: Record<string, any>,
    schema: any[],
    validationErrors: Record<string, any>,
    backendErrors: Record<string, any>,
    wasSubmitted: Ref<boolean>
  ): void {
    // 1. Reset de banderas de estado
    wasSubmitted.value = false

    // 2. Limpieza de errores
    Object.keys(validationErrors).forEach(k => delete validationErrors[k])
    Object.keys(backendErrors).forEach(k => delete backendErrors[k])

    // 3. Limpieza de campos según esquema
    schema.forEach((f: any) => {
      if (!DynamicParser.isDataField(f)) return

      const isDisabled = f.disabled === true || f.disabled === 'true'
      const isReadonly = f.readonly === true || f.readonly === 'true'

      if (isDisabled || isReadonly) return

      const propKey = DynamicParser.getProp(f)
      if (propKey) {
        const isArrayType = f.type?.includes('table') || f.type?.includes('invoice')
        model[propKey] = isArrayType ? [] : ''
      }
    })
  }
}
