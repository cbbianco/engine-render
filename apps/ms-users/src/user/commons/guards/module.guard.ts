import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ModuleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    
    // Extraer el ID del módulo desde los headers
    const moduleId = request.headers['x-module-id'] as string;
    
    if (moduleId) {
      // Inyectar en el objeto request para que esté disponible en los servicios
      request['moduleId'] = moduleId;
    }

    return true; // El guard no bloquea, solo inyecta el metadato
  }
}
