import { StyleUtils } from './StyleUtils'

/**
 * Resultado de una validación individual.
 */
export interface ValidationResult {
  invalid: boolean
  message?: string
}

/**
 * Contexto para la cadena de validación.
 */
export interface ValidationContext {
  prop: string
  value: unknown
  model: Record<string, unknown>
  item: any
}

/**
 * Interfaz base para los eslabones de la cadena de validación.
 */
abstract class ValidationHandler {
  protected nextHandler: ValidationHandler | null = null

  setNext(handler: ValidationHandler): ValidationHandler {
    this.nextHandler = handler
    return handler
  }

  abstract handle(context: ValidationContext): ValidationResult | null

  protected next(context: ValidationContext): ValidationResult {
    if (this.nextHandler) {
      return this.nextHandler.handle(context) || { invalid: false }
    }
    return { invalid: false }
  }
}

/**
 * Manejador para validación de coincidencia (match).
 */
class MatchHandler extends ValidationHandler {
  handle(context: ValidationContext): ValidationResult | null {
    const { item, value, model } = context
    const matchProp = item.match
    if (matchProp) {
      const hasMatchProp = matchProp in model && model[matchProp] !== undefined
      if (hasMatchProp && value !== model[matchProp]) {
        return { invalid: true, message: 'Las contraseñas no coinciden' }
      }
    }
    return this.next(context)
  }
}

/**
 * Manejador para validación de campo requerido.
 */
class RequiredHandler extends ValidationHandler {
  handle(context: ValidationContext): ValidationResult | null {
    const { item, value } = context
    const str = (value !== undefined && value !== null) ? String(value) : ''
    
    if (item.required && !str) {
      return { invalid: true, message: 'Este campo es obligatorio' }
    }
    return this.next(context)
  }
}

/**
 * Manejador para validación de patrón (RegExp).
 */
class PatternHandler extends ValidationHandler {
  handle(context: ValidationContext): ValidationResult | null {
    const { item, value } = context
    const validation = item.validation
    const rule = validation?.rule || 'default'
    const defaultRule = StyleUtils.DEFAULT_PATTERNS[rule] || StyleUtils.DEFAULT_PATTERNS.default
    
    const pattern = validation?.pattern || defaultRule.pattern
    const message = validation?.message || defaultRule.message
    
    const str = (value !== undefined && value !== null) ? String(value) : ''

    if (pattern && str && !(new RegExp(pattern)).test(str)) {
      return { invalid: true, message: message || 'Formato no válido' }
    }
    return this.next(context)
  }
}

/**
 * Clase utilitaria para la orquestación de validaciones.
 */
export class ValidationUtils {
  private static chain: ValidationHandler | null = null

  private static getChain(): ValidationHandler {
    if (!this.chain) {
      const match = new MatchHandler()
      const required = new RequiredHandler()
      const pattern = new PatternHandler()

      match.setNext(required).setNext(pattern)
      this.chain = match
    }
    return this.chain
  }

  /**
   * Ejecuta la validación lógica de un campo mediante el patrón Chain of Responsibility.
   */
  static runValidation(
    validationErrors: Record<string, ValidationResult>,
    model: Record<string, unknown>,
    prop: string,
    value: unknown,
    item: any
  ): boolean {
    if (!item || item.visible === false || item.readonly === true) {
      validationErrors[prop] = { invalid: false }
      return true
    }

    // Si no hay reglas ni match, es válido por defecto
    if (!item.validation?.pattern && !item.match && !item.required) {
      validationErrors[prop] = { invalid: false }
      return true
    }

    try {
      const result = this.getChain().handle({ prop, value, model, item })
      validationErrors[prop] = result || { invalid: false }
      return !validationErrors[prop].invalid
    } catch (e) {
      console.error('[ValidationUtils] Error en cadena:', e)
      validationErrors[prop] = { invalid: false }
      return true
    }
  }
}
