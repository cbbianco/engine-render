import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { AuthService } from '../auth/auth.service';
import { PayloadService } from '../payload/payload.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../entities/user/user.entity';
import * as crypto from 'crypto';
import { ExtractTokenDto, UserDomainDTO } from '../../dto/jwt/user.data.dto';
import { UserExtractUtils } from '../../utils/extract/user/user.extract.utils';
import { ModuleValidationService } from '../validation/module-validation.service';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly authRepository: UserRepository,
    private readonly auth: AuthService,
    private readonly payload: PayloadService,
    private readonly jwtService: JwtService,
    private readonly extractUser: UserExtractUtils,
    private readonly moduleValidation: ModuleValidationService,
  ) {}

  /**
   * @method updateUser
   * @description Fachada para la actualización del perfil de usuario con validación dinámica y regeneración de sesión.
   */
  async updateUser(profile: Record<string, unknown>, user: ExtractTokenDto, moduleId?: string) {
    if (!profile) {
      throw new UnauthorizedException('Los datos de actualización no han sido proporcionados');
    }

    // 1. Contexto y Recuperación de Usuario
    const userToken: UserDomainDTO = await this.extractUser.extractUser(user);
    const consultUser = await this.getUserWithPermissions(userToken.userName);

    // 2. Validación Dinámica de Esquema
    const userModules = consultUser.userRoles.flatMap(ur => ur.role.modules);
    const moduleIdentifier = moduleId || 'Mi Perfil';
    await this.moduleValidation.validateProfileSchema(moduleIdentifier, userModules, profile);

    // 3. Procesamiento de Cambios
    const oldUserName = consultUser.userName;
    const isUpdatingUserName = profile['userName'] && profile['userName'] !== oldUserName;
    
    await this.applyProfileChanges(consultUser, profile);

    try {
      // 4. Persistencia y Sincronización
      const newUserName = profile['userName'] as string;
      if (isUpdatingUserName && newUserName) {
        await this.authRepository.updateMongoConfig(oldUserName, newUserName);
      }
      const userResult = await this.authRepository.saveUser(consultUser);

      // 5. Regeneración de Sesión
      return await this.generateUpdateResponse(userResult);

    } catch (error) {
      throw new UnauthorizedException('Error al actualizar el perfil del usuario');
    }
  }

  private async getUserWithPermissions(userName: string): Promise<UserEntity> {
    const user = await this.authRepository.getUserAndPermissions(userName);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }

  private async applyProfileChanges(user: UserEntity, profile: Record<string, unknown>) {
    user.firstName = (profile['firstName'] as string) || user.firstName;
    user.lastName = (profile['lastName'] as string) || user.lastName;
    user.userName = (profile['userName'] as string) || user.userName;

    const password = profile['password'] as string;
    if (password) {
      user.password = await this.auth.hashPassword(password);
    }
  }

  private async generateUpdateResponse(user: UserEntity) {
    const config = await this.authRepository.consultUser(user.userName);
    const payloadUser = await this.payload.generatePayload(user, config.publicKey);
    const iv = crypto.randomBytes(16);

    return {
      message: 'Perfil Actualizado con Éxito',
      user: user,
      access_token: this.jwtService.sign({
        content: payloadUser,
        iv: iv.toString('hex'),
      }),
    };
  }
}
