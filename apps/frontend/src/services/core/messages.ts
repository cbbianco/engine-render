import type { LoginTextsModal } from '@/model/auth/login-texts.dto'

export class MessageService {
  /**
   * Retorna un objeto con el título y mensaje correspondiente al código de estado HTTP.
   * Utiliza las traducciones proporcionadas en el modal de textos de login.
   */
  static messageForStatus(status: number, m: LoginTextsModal): { title: string; message: string } {
    // Errores de servidor (500+)
    if (status >= 500) {
      return { 
        title: m.internalErrorTitle, 
        message: m.internalErrorMessage 
      }
    }
    
    // Recurso no encontrado
    if (status === 404) {
      return { 
        title: m.userNotFoundTitle, 
        message: m.userNotFoundMessage 
      }
    }
    
    // Errores de cliente (400-499)
    if (status >= 400 && status < 500) {
      return { 
        title: m.badRequestTitle, 
        message: m.badRequestMessage 
      }
    }

    // Respuesta genérica por defecto
    return { 
      title: m.genericTitle, 
      message: m.genericMessage 
    }
  }
}
