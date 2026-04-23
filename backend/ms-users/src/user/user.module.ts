import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MongoRepository } from 'typeorm';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { UsersController } from './controller/users.controller';
import { UserService } from './service/user.service';
import { UserConfigEntity } from './entities/config/user.config.entity';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './service/auth/auth.service';
import { PayloadService } from './service/payload/payload.service';
import { UserEntity } from './entities/user/user.entity';
import { RoleEntity } from './entities/role/role.entity';
import { ModuleEntity } from './entities/module/module.entity';
import { UserRoleEntity } from './entities/role/user-role.entity';
import { UserExtractUtils } from './utils/extract/user/user.extract.utils';
import { ModuleConfigEntity } from './entities/module/module-json.entity';
import { ExtractTokenUtils } from './utils/extract/token/extract.token.utils';
import { ModuleValidationService } from './service/validation/module-validation.service';
import { UserResponseInterceptor } from './commons/interceptors/user-response.interceptor';
import { UserVerificationService } from './service/user/user-verification.service';
import { UserListService } from './service/user/user-list.service';
import { UserCreationService } from './service/user/user-creation.service';
import { UserProfileService } from './service/user/user-profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [UserEntity, RoleEntity, ModuleEntity, UserRoleEntity],
      'mysql',
    ),
    TypeOrmModule.forFeature([UserConfigEntity, ModuleConfigEntity], 'mongo'),
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    UserRepository,
    AuthService,
    PayloadService,
    UserExtractUtils,
    ExtractTokenUtils,
    ModuleValidationService,
    UserVerificationService,
    UserListService,
    UserCreationService,
    UserProfileService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserResponseInterceptor,
    },
  ],
  exports: [UserExtractUtils, ExtractTokenUtils],
})
export class UserModule {}
