import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../entities/user/user.entity';
import { Path, UserPayloadDto } from '../../dto/user/user.payload.dto';
import { ModuleEntity } from '../../entities/module/module.entity';

@Injectable()
export class PayloadService {
  async generatePayload(
    consultUser: UserEntity,
    publicKey: string = '',
  ): Promise<Record<string, UserPayloadDto>> {
    if (!consultUser) return {};

    const record: Record<string, UserPayloadDto> = {};

    record[consultUser.userName] = {
      userName: consultUser.userName,
      isActive: consultUser.isActive,
      password: consultUser.password,
      publicKey: publicKey,
      path: [],
      roleId: consultUser.userRoles[0]?.roleId ?? -1,
    };

    const modules = consultUser.userRoles.flatMap((userRole) => {
      return userRole.role.modules;
    });

    modules.reduce((acc: Path[], module: ModuleEntity) => {
      const isDuplicate = record[consultUser.userName].path.some(
        (p) => p.path === module.path && p.method === module.method,
      );

      if (!isDuplicate && module.path) {
        record[consultUser.userName].path.push({
          path: module.path,
          method: module.method,
          order: module.order,
          pathActive: module.pathActive ?? 0,
        });
      }

      return acc;
    }, []);

    return record;
  }
}
