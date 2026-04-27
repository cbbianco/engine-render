import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'TU_SUPER_SECRET_KEY_IA_CRM',
      });
      
      const content = payload.content;
      const userName = Object.keys(content)[0];
      const userData = content[userName];
      
      // Resolvemos el ID real del usuario desde ms-users (porque el token no lo trae)
      let userId = '';
      try {
        const userRes = await fetch(`http://localhost:4001/api/v1/users/username/${userName}`);
        if (userRes.ok) {
          const userObj = await userRes.json();
          userId = String(userObj.id || '');
        }
      } catch (err) {
        console.error('[AuthGuard] No se pudo resolver el ID para', userName);
      }
      
      request['user'] = {
        userName: userName,
        userId: userId, // Inyectamos el ID resuelto
        ...userData
      };
      
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
