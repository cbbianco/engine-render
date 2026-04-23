import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { DECRYPT_PASSWORD_KEY } from '../decorators/decrypt-password.decorator';
import { UserRepository } from '../../repository/user.repository';
import { AuthService } from '../../service/auth/auth.service';

@Injectable()
export class PasswordDecryptionInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const isDecryptRequired = this.reflector.getAllAndOverride<boolean>(
      DECRYPT_PASSWORD_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isDecryptRequired) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (body && body.password) {
      // 1. Identificar el cliente para obtener su llave privada
      let userName = body.userName;

      // Buscamos el userName del token si existe
      const tokenPayload = request['user'];
      let authUserName = '';
      if (tokenPayload) {
        const domains = Object.keys(tokenPayload.content);
        authUserName = domains[0];
      }

      if (!userName && authUserName) {
        userName = authUserName;
      }

      if (!userName) {
        throw new UnauthorizedException('No se pudo identificar al cliente para el descifrado');
      }

      // 2. Consultar configuración en Mongo
      let config;
      try {
        config = await this.userRepository.consultUser(userName);
      } catch (error) {
        // Fallback: Si falló buscando el config del target (userName), intentamos con el del autenticado (authUserName)
        // Útil cuando se está creando un nuevo usuario que aún no tiene config
        if (authUserName && authUserName !== userName) {
          try {
            config = await this.userRepository.consultUser(authUserName);
          } catch (e) {
            throw new UnauthorizedException('Configuración de seguridad no encontrada para el descifrado');
          }
        } else {
          throw error;
        }
      }

      if (!config || !config.privateKey) {
        throw new UnauthorizedException('Configuración de seguridad no válida (sin llave privada)');
      }

      // 3. Descifrar password
      const decryptedPassword = await this.authService.decryptPassword(body.password, config.privateKey);
      
      if (!decryptedPassword) {
        throw new UnauthorizedException('Error al descifrar el password');
      }

      // 4. Reemplazar en el body
      request.body.password = decryptedPassword;

      // 5. Descifrar confirmarPassword si existe
      if (body.confirmarPassword) {
        const decryptedConfirm = await this.authService.decryptPassword(body.confirmarPassword, config.privateKey);
        if (decryptedConfirm) {
          request.body.confirmarPassword = decryptedConfirm;
        }
      }
    }

    return next.handle();
  }
}
