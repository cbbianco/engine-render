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
import { UserConfigEntity } from '../../entities/config/user.config.entity';
import { RsaSecurity } from '../../commons/security/rsa/rsa.security';
import { UserCreateDto } from '../../dto/user/user.create.dto';

@Injectable()
export class UserCreationService {
  constructor(
    private readonly authRepository: UserRepository,
    private readonly auth: AuthService,
    private readonly payload: PayloadService,
    private readonly jwtService: JwtService,
    private readonly extractUser: UserExtractUtils,
    private readonly moduleValidation: ModuleValidationService,
  ) {}

  /**
   * @method createUser
   * @description Creates a new user after validating the schema dynamically and generating security keys.
   * 
   * @param create 
   * @param currentUser 
   */
  async createUser(create: UserCreateDto, currentUser: ExtractTokenDto) {
    if (!create) {
      throw new BadRequestException('El perfil del usuario no ha sido proporcionado o es inválido');
    }
    const userContext: UserDomainDTO = await this.extractUser.extractUser(currentUser);

    // 1. Validar si el usuario ya existe
    const existingUser = await this.authRepository.findUserByUserName(create.userName!);

    if (existingUser) {
      throw new BadRequestException('El nombre de usuario ya está registrado');
    }

    // 2. Obtener módulos del usuario actual para validación de esquema
    const consultCurrentUser = await this.authRepository.getUserAndPermissions(userContext.userName);
    if (!consultCurrentUser) {
      throw new BadRequestException('Usuario actual (autenticado) no encontrado en la base de datos');
    }

    const currentUserModules: ModuleEntity[] = consultCurrentUser.userRoles.flatMap(ur => ur.role.modules);

    // 3. Validar dinámicamente contra el esquema de "Crear Usuario"
    await this.moduleValidation.validateProfileSchema('Crear Usuario', currentUserModules, create);

    // 4. Crear entidad de usuario (MySQL)
    const newUser = new UserEntity();
    newUser.firstName = create.firstName!;
    newUser.lastName = create.lastName!;
    newUser.userName = create.userName!;
    newUser.password = await this.auth.hashPassword(create.password!);
    newUser.isActive = 1;

    try {
      // 5. Persistir Usuario en MySQL
      const savedUser = await this.authRepository.saveUser(newUser);

      // 6. Asignar Rol (Default 'admin' si viene en create.role)
      const roleName = create.role || 'admin';
      const role = await this.authRepository.findRoleByName(roleName);
      if (role) {
        const userRole = new UserRoleEntity();
        userRole.userId = Number(savedUser.id);
        userRole.roleId = Number(role.id);
        userRole.createdBy = userContext.userName;
        await this.authRepository.saveUserRole(userRole);
      }

      // 7. Generar llaves RSA y crear Config en MongoDB
      const keys = RsaSecurity.generateRSAKeys();
      const userConfig = new UserConfigEntity();
      userConfig.customer = create.userName!;
      userConfig.userName = create.userName!;
      userConfig.publicKey = keys.publicKey;
      userConfig.privateKey = keys.privateKey;

      // Branding por defecto y personalizado
      userConfig.logo = "https://i.ibb.co/5xvrqHCx/logo-1.png";
      userConfig.colorCss = {
        primary: create.primary || "blue",
        secondary: create.secondary || "blue",
        errorColor: create.errorColor || "red"
      };
      userConfig.loginTexts = {
        title: "Iniciar Sesión",
        subtitle: "Introduzca sus credenciales",
        domainLabel: "Dominio",
        passwordLabel: "Clave",
        domainPlaceholder: "Ej. midominio.com",
        passwordPlaceholder: "Introduzca su clave",
        submitButton: "Iniciar",
        loadingButton: "Iniciando sesión...",
        noRoutes: "No hay rutas asignadas a este usuario.",
        errors: {
          domainRequired: "El campo dominio es requerido",
          domainNoSpaces: "El dominio no puede contener espacios",
          domainNoHttps: "No incluya https:// ni http://. Use solo el dominio (ej. midominio.com)",
          domainInvalidFormat: "Formato de dominio no válido",
          passwordRequired: "El campo clave es requerido",
          passwordNoSpaces: "La clave no puede contener espacios"
        },
        modal: {
          internalErrorTitle: "Error interno",
          internalErrorMessage: "Error interno. Contacte al administrador.",
          userNotFoundTitle: "Usuario no encontrado",
          userNotFoundMessage: "No se pudo encontrar el usuario.",
          badRequestTitle: "Solicitud incorrecta",
          badRequestMessage: "Credenciales o solicitud inválidas.",
          genericTitle: "Error",
          genericMessage: "Ocurrió un error. Intente de nuevo."
        }
      };

      await this.authRepository.saveUserConfig(userConfig);

      // 8. Cargar el usuario completo (con roles y módulos) para el payload
      const fullUser = await this.authRepository.getUserAndPermissions(savedUser.userName);
      if (!fullUser) throw new Error('Error al recuperar el usuario creado');

      const payloadUser = await this.payload.generatePayload(fullUser, keys.publicKey);
      const iv = crypto.randomBytes(16);

      return {
        message: 'Usuario Creado con Éxito',
        user: {
          id: savedUser.id,
          userName: savedUser.userName,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
        },
        access_token: this.jwtService.sign({
          content: payloadUser,
          iv: iv.toString('hex'),
        }),
        publicKey: keys.publicKey
      };
    } catch (error) {
      console.error('[UserCreationService.createUser] Error:', error);
      throw new UnauthorizedException('Error al crear el usuario');
    }
  }
}
