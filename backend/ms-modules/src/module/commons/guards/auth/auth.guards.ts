import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ExtractTokenUtils } from '../../../utils/extract/token/extract.token.utils';
import { UnauthorizedSYSException } from '../../../exception/unauthorized/unauthorized.sys.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly extract: ExtractTokenUtils,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extract.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedSYSException(
        'No enviaste el token, acceso denegado.',
        401,
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'TU_SUPER_SECRET_KEY_IA_CRM',
      });

      const domains = Object.values(payload.content);
      if (domains.length === 0) {
        throw new Error('Token sin información de usuario');
      }

      // TODO: Validación de rol en BD (TypeORM) si se requiere restricción por rol
      request['user'] = payload;
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Token inválido o permisos insuficientes.';
      throw new UnauthorizedSYSException(message, 401);
    }
  }
}
