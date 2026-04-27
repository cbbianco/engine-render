import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { ExtractTokenDto } from '../../dto/jwt/user.data.dto';

@Injectable()
export class UserListService {
  constructor(private readonly authRepository: UserRepository) {}

  /**
   * @method getUsersPaginated
   * @description Retrieves a paginated list of users with associated module configuration.
   * 
   * @param {number} page
   * @param {number} limit
   * @param {ExtractTokenDto} currentUser
   */
  async getUsersPaginated(page: number = 1, limit: number = 10, currentUser?: ExtractTokenDto, moduleId?: string) {
    if (!moduleId) {
      throw new UnprocessableEntityException('[ERROR DE CONFIGURACIÓN] El moduleId es obligatorio para este módulo');
    }

    const skip = (page - 1) * limit;
    const [users, total] = await this.authRepository.findAllPaginated(skip, limit);

    // 1. Obtener configuración del componente directamente por ID de Mongo (UUID)
    const moduleUuid = moduleId;
    let component: any = null;

    const config = await this.authRepository.getModuleConfig(moduleUuid);
    if (!config) {
      throw new UnprocessableEntityException('[ERROR DE CONFIGURACIÓN] No se encontró la configuración del módulo especificado');
    }
    if (config) {
      // En este sistema, el esquema contiene la definición de las columnas/campos del componente
      const mainComponent = config.configurationUi?.schema?.find(c => c.type?.includes('table')) || config.configurationUi?.schema?.[0];

      component = {
        type: mainComponent?.type || 'table-premium',
        properties: config.configurationUi?.schema || []
      };
    }

    return {
      component,
      data: users.map(user => ({
        id: user.id,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: user.userRoles.map(ur => ur.role.name),
      })),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * @method findUserByUserName
   * @description Finds a user by their username.
   */
  async findUserByUserName(userName: string) {
    const user = await this.authRepository.findUserByUserName(userName);
    if (!user) return null;
    return {
      id: user.id,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  /**
   * @method searchUsers
   * @description Searches for users by query.
   */
  async searchUsers(query: string) {
    const users = await this.authRepository.searchUsers(query);
    return users.map(user => ({
      id: user.id,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
  }

  /**
   * @method findAllForMentions
   * @description Retrieves all users for tagging purposes.
   */
  async findAllForMentions() {
    const users = await this.authRepository.findAllSimple();
    return users.map(user => ({
      id: user.id,
      userName: user.userName,
    }));
  }
}
