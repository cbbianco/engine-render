import { reactive, computed } from 'vue'
import type { SchemaField, Validation } from '@/model/module/create-assignation.dto'

export function useModuleValidation(schema: SchemaField[], model: Record<string, string>) {
  const errors = reactive<Record<string, string | null>>({})

  function getFieldKey(field: SchemaField, index: number): string {
    const base = field.property || 'field'
    return `${base}_${index}`
  }

  // Initialize errors
  schema.forEach((field, index) => {
    if (field.tag !== 'button') {
      const key = getFieldKey(field, index)
      errors[key] = null
    }
  })

  /**
   * Valida un campo específico basado en su configuración de validación.
   */
  const validateField = (field: SchemaField, index: number): boolean => {
    if (field.tag === 'button') return true
    
    const key = getFieldKey(field, index)
    const value = model[key] ?? ''
    const validation = field.validation

    if (!validation) return true
    const { pattern, message } = validation

    if (pattern) {
      try {
        const regex = new RegExp(pattern)
        if (!regex.test(value)) {
          errors[key] = message || 'Formato inválido'
          return false
        }
      } catch (e) {
        console.error(`Invalid regex pattern for field ${key}:`, pattern)
      }
    }

    errors[key] = null
    return true
  }

  /**
   * Valida todos los campos del formulario.
   */
  const validateAll = (): boolean => {
    let isValid = true
    schema.forEach((field, index) => {
      if (field.tag !== 'button') {
        const fieldValid = validateField(field, index)
        if (!fieldValid) isValid = false
      }
    })
    return isValid
  }

  /**
   * Verifica si un campo tiene error.
   */
  const hasError = (property: string): boolean => {
    return !!errors[property]
  }

  /**
   * Obtiene el mensaje de error de un campo.
   */
  const getErrorMessage = (property: string): string => {
    return errors[property] || ''
  }

  return {
    errors,
    validateField,
    validateAll,
    hasError,
    getErrorMessage
  }
}
