import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { AuthService } from '../auth/auth.service';
import { PayloadService } from '../payload/payload.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../entities/user/user.entity';
import { ModuleEntity } from '../../entities/module/module.entity';
import * as crypto from 'crypto';
import { ExtractTokenDto, UserDomainDTO } from '../../dto/jwt/user.data.dto';
import { UserExtractUtils } from '../../utils/extract/user/user.extract.utils';
import { ModuleValidationService } from '../validation/module-validation.service';
import { UserProfileDto } from '../../dto/user/user.profile.dto';

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
   * @description Executes the user profile update after validating the schema dynamically.
   * 
   * @param profile 
   * @param user 
   */
  async updateUser(profile: UserProfileDto, user: ExtractTokenDto) {
    if (!profile) {
      throw new UnauthorizedException('Los datos de actualización no han sido proporcionados');
    }
    const userToken: UserDomainDTO = await this.extractUser.extractUser(user);

    // 1. Consultar Usuario (ahora como primer paso para optimizar)
    const consultUser: UserEntity | null =
      await this.authRepository.getUserAndPermissions(userToken.userName);

    if (!consultUser) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Aplanar los módulos del usuario desde sus roles
    const userModules: ModuleEntity[] = consultUser.userRoles.flatMap(ur => ur.role.modules);

    // 2. Validar dinámicamente contra el esquema de Mongo usando los módulos ya cargados
    await this.moduleValidation.validateProfileSchema('Mi Perfil', userModules, profile);

    // 3. Ejecutar lógica de negocio
    const oldUserName = consultUser.userName;
    const isUpdatingUserName = profile.userName && profile.userName !== oldUserName;

    // Actualizar campos
    consultUser.firstName = profile.firstName || consultUser.firstName;
    consultUser.lastName = profile.lastName || consultUser.lastName;
    consultUser.userName = profile.userName || consultUser.userName;

    // 4. Actualizar contraseña con seguridad si se proporciona (Gestionado por Interceptor)
    if (profile.password) {
      consultUser.password = await this.auth.hashPassword(profile.password);
    }

    try {
      // Sincronizar Mongo si aplica
      if (isUpdatingUserName && profile.userName) {
        await this.authRepository.updateMongoConfig(oldUserName, profile.userName);
      }

      // Persistir en MySQL
      const userResult = await this.authRepository.saveUser(consultUser);

      // Regenerar payload y token
      const config = await this.authRepository.consultUser(consultUser.userName);
      const payloadUser = await this.payload.generatePayload(consultUser, config.publicKey);
      const iv = crypto.randomBytes(16);

      return {
        message: 'Perfil Actualizado con Éxito',
        user: userResult,
        access_token: this.jwtService.sign({
          content: payloadUser,
          iv: iv.toString('hex'),
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('Error al actualizar el perfil del usuario');
    }
  }
}
