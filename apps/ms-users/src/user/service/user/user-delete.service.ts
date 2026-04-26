import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
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

      // 2. Eliminar asignaciones de módulos primero (MySQL - assignation_module)
      // Esto evita errores de clave foránea al intentar borrar el módulo después
      const assignations = await this.userRepository.findModuleAssignationsByUserId(id);
      await this.userRepository.deleteModuleAssignations(id);

      // 3. Eliminar módulos huérfanos (MySQL + MongoDB)
      for (const assign of assignations) {
        if (assign.module) {
          console.log(`[UserDeleteService] Eliminando configuración de módulo en Mongo: ${assign.module.uuid}`);
          await this.userRepository.deleteModuleConfigByUuid(assign.module.uuid);
          
          console.log(`[UserDeleteService] Eliminando registro de módulo en MySQL: ${assign.module.id}`);
          await this.userRepository.deleteModuleById(assign.module.id);
        }
      }

      // 4. Eliminar roles asignados (MySQL - users_roles)
      await this.userRepository.deleteUserRoles(id);

      // 5. Eliminar configuración de cliente en MongoDB (customers)
      await this.userRepository.deleteUserConfig(user.userName);

      // 6. Eliminar usuario base (MySQL - users)
      await this.userRepository.deleteUser(id);

      return {
        message: 'Usuario, módulos y datos asociados eliminados con éxito',
        userName: user.userName,
        deletedModules: assignations.length,
        id
      };
    } catch (error) {
      console.error('[UserDeleteService.deleteUser] Error:', error);
      throw new UnprocessableEntityException(`Error al eliminar el usuario y sus dependencias: ${error.message}`);
    }
  }
}
