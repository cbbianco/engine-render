import { Injectable } from '@nestjs/common';
import { UserConfigEntity } from '../../entities/config/user.config.entity';
import { RsaSecurity } from '../../commons/security/rsa/rsa.security';

@Injectable()
export class UserConfigService {
  /**
   * Genera la configuración por defecto para un nuevo usuario, incluyendo llaves RSA y branding.
   */
  createDefaultConfig(userName: string, primary?: string, secondary?: string, errorColor?: string): { config: UserConfigEntity; privateKey: string } {
    const keys = RsaSecurity.generateRSAKeys();
    const config = new UserConfigEntity();
    
    config.customer = userName;
    config.userName = userName;
    config.publicKey = keys.publicKey;
    config.privateKey = keys.privateKey;
    
    // Branding por defecto
    config.logo = "https://i.ibb.co/5xvrqHCx/logo-1.png";
    config.colorCss = {
      primary: primary || "blue",
      secondary: secondary || "blue",
      errorColor: errorColor || "red"
    };
    
    // Textos de Login por defecto
    config.loginTexts = this.getDefaultLoginTexts();
    
    return { config, privateKey: keys.privateKey };
  }

  private getDefaultLoginTexts() {
    return {
      title: "Iniciar Sesión",
      subtitle: "Introduzca sus credenciales",
      domainLabel: "Dominio",
      passwordLabel: "Clave",
      domainPlaceholder: "Ej. midominio.com",
      passwordPlaceholder: "Introduzca su clave",
      submitButton: "Iniciar",
      loadingButton: "Iniciando sesión...",
      noRoutes: "No hay rutas asignadas a este usuario.",
      errors: {
        domainRequired: "El campo dominio es requerido",
        domainNoSpaces: "El dominio no puede contener espacios",
        domainNoHttps: "No incluya https:// ni http://. Use solo el dominio (ej. midominio.com)",
        domainInvalidFormat: "Formato de dominio no válido",
        passwordRequired: "El campo clave es requerido",
        passwordNoSpaces: "La clave no puede contener espacios"
      },
      modal: {
        internalErrorTitle: "Error interno",
        internalErrorMessage: "Error interno. Contacte al administrador.",
        userNotFoundTitle: "Usuario no encontrado",
        userNotFoundMessage: "No se pudo encontrar el usuario.",
        badRequestTitle: "Solicitud incorrecta",
        badRequestMessage: "Credenciales o solicitud inválidas.",
        genericTitle: "Error",
        genericMessage: "Ocurrió un error. Intente de nuevo."
      }
    };
  }
}
