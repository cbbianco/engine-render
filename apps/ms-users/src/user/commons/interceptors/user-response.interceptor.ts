import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../repository/user.repository';
import { PayloadService } from '../../service/payload/payload.service';

@Injectable()
export class UserResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly payloadService: PayloadService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userPayload = request['user'];

    return next.handle().pipe(
      switchMap(async (data) => {
        let userName: string | null = null;

        // 1. Extraer el nombre de usuario del payload del request o del access_token en la respuesta
        if (userPayload?.content) {
          userName = Object.keys(userPayload.content)[0];
        } else if (userPayload?.userName) {
          userName = userPayload.userName;
        } else if (data?.access_token || data?.data?.access_token) {
          const token = data?.access_token || data?.data?.access_token;
          try {
            const decoded = this.jwtService.decode(token) as any;
            if (decoded?.content) {
              userName = Object.keys(decoded.content)[0];
            }
          } catch (e) {
            userName = null;
          }
        }

        if (!userName) {
          console.log('[UserResponseInterceptor] No user information found, skipping injection.');
          return data;
        }

        // 2. Consultar la base de datos para obtener los permisos actualizados
        const consultUser = await this.userRepository.getUserAndPermissions(userName);
        if (!consultUser) {
          return data;
        }

        // 3. Generar el payload con los paths
        const payloadRecord = await this.payloadService.generatePayload(consultUser);
        const userPayloadData = payloadRecord[userName];

        if (!userPayloadData) {
          return data;
        }

        // 4. Mapear a la estructura de salida requerida (con path_active en snake_case)
        const paths = userPayloadData.path
          .map((p) => ({
            path: p.path,
            method: p.method,
            order: p.order,
            path_active: p.pathActive,
          }))
          .sort((a, b) => a.order - b.order);

        // 5. Inyectar el path en la respuesta original sin envolverla si ya es un objeto
        if (typeof data === 'object' && data !== null) {
          if (Array.isArray(data)) {
            // Si por alguna razón la respuesta es un array puro, no podemos inyectar fácilmente sin envolver,
            // pero los controladores de este MS suelen devolver objetos { data, meta } o respuestas de login.
            return data; 
          }
          return {
            ...data,
            path: paths,
          };
        }

        return data;
      }),
    );
  }
}
