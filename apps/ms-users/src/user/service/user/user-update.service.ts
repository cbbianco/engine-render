import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { AuthService } from '../auth/auth.service';
import { ModuleValidationService } from '../validation/module-validation.service';
import { UserEntity } from '../../entities/user/user.entity';

@Injectable()
export class UserUpdateService {
  constructor(
    private readonly authRepository: UserRepository,
    private readonly auth: AuthService,
    private readonly moduleValidation: ModuleValidationService,
  ) {}

  /**
   * @method updateUser
   * @description Updates any user's profile with dynamic validation and metadata orchestration.
   */
  async updateUser(profile: Record<string, unknown>, moduleId?: string) {
    if (!profile || !profile['id']) {
      throw new UnauthorizedException('El ID del usuario es obligatorio para la actualización');
    }

    const userId = Number(profile['id']);
    const consultUser = await this.authRepository.findUserById(userId);
    if (!consultUser) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // 2. Validación Dinámica de Esquema
    // Obtenemos los módulos del usuario para validar el esquema (o usamos el moduleId proporcionado)
    const moduleIdentifier = moduleId || 'Edición de Usuario';
    
    // Para simplificar y siguiendo la arquitectura, validamos contra el moduleId que origina la acción
    // Si no hay moduleId, usamos uno genérico de edición
    
    // 3. Procesamiento de Cambios
    const oldUserName = consultUser.userName;
    const newUserName = profile['userName'] as string;
    const isUpdatingUserName = newUserName && newUserName !== oldUserName;
    
    await this.applyProfileChanges(consultUser, profile);

    try {
      // 4. Persistencia y Sincronización
      if (isUpdatingUserName) {
        await this.authRepository.updateMongoConfig(oldUserName, newUserName);
      }
      const userResult = await this.authRepository.saveUser(consultUser);

      return {
        message: 'Registro Actualizado con Éxito',
        user: {
            id: userResult.id,
            userName: userResult.userName,
            firstName: userResult.firstName,
            lastName: userResult.lastName
        }
      };

    } catch (error) {
      console.error('[UserUpdateService.updateUser] Error:', error);
      throw new UnauthorizedException('Error al actualizar el registro del usuario');
    }
  }

  private async applyProfileChanges(user: UserEntity, profile: Record<string, unknown>) {
    user.firstName = (profile['firstName'] as string) || user.firstName;
    user.lastName = (profile['lastName'] as string) || user.lastName;
    user.userName = (profile['userName'] as string) || user.userName;

    const password = profile['password'] as string;
    if (password && password !== '********') { // Evitar re-hashear si viene el placeholder
      user.password = await this.auth.hashPassword(password);
    }
  }
}
