import { HAS_PROTOCOL } from '@/utils/common/constants'
import type { LoginTexts } from '@/model/auth/login-texts.dto'

export interface ValidationResult {
  valid: boolean
  domainError: string
  userNameError: string
  passwordError: string
}

/**
 * Valida los campos de inicio de sesión de forma centralizada.
 * @param domain El dominio ingresado
 * @param userName El nombre de usuario ingresado
 * @param password La contraseña ingresada
 * @param t Los textos de login para mensajes de error localizados
 */
export function validateLogin(
  domain: string,
  userName: string,
  password: string,
  t: LoginTexts
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    domainError: '',
    userNameError: '',
    passwordError: ''
  }

  const domainTrimmed = domain.trim()
  const userNameTrimmed = userName.trim()

  // Validar Dominio
  if (!domainTrimmed) {
    result.domainError = t.errors.domainRequired
    result.valid = false
  } else if (/\s/.test(domain)) {
    result.domainError = t.errors.domainNoSpaces
    result.valid = false
  } else if (HAS_PROTOCOL.test(domainTrimmed)) {
    result.domainError = t.errors.domainNoHttps
    result.valid = false
  }

  // Validar Usuario (userName)
  if (!userNameTrimmed) {
    // Si no hay un texto específico para username, usamos dominio como fallback o un genérico
    result.userNameError = t.errors.domainRequired // Reutilizamos marcador si es necesario o genérico
    result.valid = false
  } else if (/\s/.test(userName)) {
    result.userNameError = t.errors.domainNoSpaces
    result.valid = false
  }

  // Validar Password
  if (!password) {
    result.passwordError = t.errors.passwordRequired
    result.valid = false
  } else if (/\s/.test(password)) {
    result.passwordError = t.errors.passwordNoSpaces
    result.valid = false
  }

  return result
}
