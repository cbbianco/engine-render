import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../../../dto/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (typeof user?.content === 'string') {
      throw new ForbiddenException(
        'El contenido del token está cifrado. No se puede validar el rol.',
      );
    }

    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const domains = user?.content ? Object.values(user.content) : [];
    const userData: any = domains[0];

    const hasRole = requiredRoles.includes(userData?.roleId);

    if (!hasRole) {
      throw new ForbiddenException(
        'Acceso denegado: Se requiere rol de SuperAdmin',
      );
    }

    return true;
  }
}
