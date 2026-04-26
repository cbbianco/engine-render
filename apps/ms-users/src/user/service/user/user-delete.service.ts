import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';

@Injectable()
export class UserDeleteService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method deleteUser
   * @description Deletes a user and all associated data in MySQL and MongoDB.
   * 
   * @param {number} id
   */
  async deleteUser(id: number) {
    // 1. Verificar existencia del usuario
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    try {
      console.log(`[UserDeleteService] Iniciando eliminación del usuario: ${user.userName} (ID: ${id})`);

      // 2. Eliminar asignaciones de módulos (MySQL - assignation_module)
      await this.userRepository.deleteModuleAssignations(id);

      // 3. Eliminar roles asignados (MySQL - users_roles)
      await this.userRepository.deleteUserRoles(id);

      // 4. Eliminar configuración en MongoDB (customers)
      await this.userRepository.deleteUserConfig(user.userName);

      // 5. Eliminar usuario base (MySQL - users)
      await this.userRepository.deleteUser(id);

      return {
        message: 'Usuario y datos asociados eliminados con éxito',
        userName: user.userName,
        id
      };
    } catch (error) {
      console.error('[UserDeleteService.deleteUser] Error:', error);
      throw new UnauthorizedException('Error al eliminar el usuario y sus dependencias');
    }
  }
}
