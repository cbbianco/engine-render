import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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
import { UserRoleEntity } from '../../entities/role/user-role.entity';
import { UserConfigService } from './user-config.service';

@Injectable()
export class UserCreationService {
  constructor(
    private readonly authRepository: UserRepository,
    private readonly auth: AuthService,
    private readonly payload: PayloadService,
    private readonly jwtService: JwtService,
    private readonly extractUser: UserExtractUtils,
    private readonly moduleValidation: ModuleValidationService,
    private readonly configService: UserConfigService,
  ) {}

  /**
   * @method createUser
   * @description Fachada para la creación de un nuevo usuario con orquestación de seguridad y configuración.
   */
  async createUser(create: Record<string, unknown>, currentUser: ExtractTokenDto, moduleId?: string, logoFile?: Express.Multer.File) {
    if (logoFile) {
      create['logoPath'] = logoFile.path;
    }
    if (!create) {
      throw new BadRequestException('El perfil del usuario no ha sido proporcionado o es inválido');
    }

    // 1. Contexto y Validación de Existencia
    const userContext: UserDomainDTO = await this.extractUser.extractUser(currentUser);
    const userName = (create['userName'] as string) || '';
    await this.validateUserUniqueness(userName);

    // 2. Validación Dinámica de Esquema (Metadata)
    const currentUserModules = await this.getUserModules(userContext.userName);
    const moduleIdentifier = moduleId || 'Creación de Usuario';
    await this.moduleValidation.validateProfileSchema(moduleIdentifier, currentUserModules, create);

    try {
      // 3. Persistencia Core (MySQL)
      const savedUser = await this.persistBaseUser(create);
      await this.assignDefaultRole(savedUser, create['role'] as string, userContext.userName);

      // 4. Configuración y Seguridad (MongoDB)
      const { config, privateKey } = this.configService.createDefaultConfig(create);
      await this.authRepository.saveUserConfig(config);

      // 5. Generación de Respuesta y Payload
      return await this.generateCreationResponse(savedUser, privateKey);
      
    } catch (error) {
      console.error('[UserCreationService.createUser] Error:', error);
      throw new UnauthorizedException('Error al crear el usuario');
    }
  }

  private async validateUserUniqueness(userName: string) {
    const existingUser = await this.authRepository.findUserByUserName(userName);
    if (existingUser) {
      throw new BadRequestException('El nombre de usuario ya está registrado');
    }
  }

  private async getUserModules(userName: string): Promise<ModuleEntity[]> {
    const user = await this.authRepository.getUserAndPermissions(userName);
    if (!user) {
      throw new BadRequestException('Usuario actual no encontrado');
    }
    return user.userRoles.flatMap(ur => ur.role.modules);
  }

  private async persistBaseUser(create: Record<string, unknown>): Promise<UserEntity> {
    const newUser = new UserEntity();
    newUser.firstName = (create['firstName'] as string) || '';
    newUser.lastName = (create['lastName'] as string) || '';
    newUser.userName = (create['userName'] as string) || '';
    newUser.password = await this.auth.hashPassword((create['password'] as string) || '');
    newUser.isActive = 1;

    return await this.authRepository.saveUser(newUser);
  }

  private async assignDefaultRole(user: UserEntity, requestedRole: string | undefined, creator: string) {
    const roleName = requestedRole || 'admin';
    const role = await this.authRepository.findRoleByName(roleName);
    if (role) {
      const userRole = new UserRoleEntity();
      userRole.userId = Number(user.id);
      userRole.roleId = Number(role.id);
      userRole.createdBy = creator;
      await this.authRepository.saveUserRole(userRole);
    }
  }

  private async generateCreationResponse(user: UserEntity, privateKey: string) {
    const fullUser = await this.authRepository.getUserAndPermissions(user.userName);
    if (!fullUser) throw new Error('Error al recuperar el usuario creado');

    const config = await this.authRepository.consultUser(user.userName);
    const payloadUser = await this.payload.generatePayload(fullUser, config.publicKey);
    const iv = crypto.randomBytes(16);

    return {
      message: 'Usuario Creado con Éxito',
      user: {
        id: user.id,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      access_token: this.jwtService.sign({
        content: payloadUser,
        iv: iv.toString('hex'),
      }),
      publicKey: config.publicKey
    };
  }
}
