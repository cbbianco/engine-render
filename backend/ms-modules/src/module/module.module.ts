import { Module } from '@nestjs/common';
import { ModuleController } from './controller/module.controller';
import { ExtractPayload } from './utils/cipher/extract.payload';
import { JwtModule } from '@nestjs/jwt';
import { ModuleGenerateService } from './service/generate/module-generate.service';
import { IAService } from './service/commons/ia.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerateJsonDto } from './dto/jwt/generate-json.dto';
import { GeneratePersistService } from './service/generate/persist/generate-persist.service';
import { AuthGuard } from './commons/guards/auth/auth.guards';
import { ExtractTokenUtils } from './utils/extract/token/extract.token.utils';
import { UserRepository } from './repository/user/user.repository';
import { ModuleRepository } from './repository/modules/module.repository';
import { UserRoleEntity } from './entities/role/user-role.entity';
import { ModuleEntity } from './entities/module/module.entity';
import { RoleEntity } from './entities/role/role.entity';
import { UserEntity } from './entities/user/user.entity';
import { ModuleConfigEntity } from './entities/module/module-json.entity';
import { AssignedRepository } from './repository/assgined/assigned.repository';
import { AssignationModuleEntity } from './entities/module/assing-module.entity';
import { PromptUtils } from './utils/prompt/prompt.utils';
import { ModuleHydratorUtils } from './utils/hydrator/module-hydrator.utils';
import { FunctionsExecutionsService } from './service/commons/functions/functions.executions.service';
import { UserExtractUtils } from './utils/extract/user/user.extract.utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([GenerateJsonDto, ModuleConfigEntity], 'mongo'),
    TypeOrmModule.forFeature(
      [
        UserEntity,
        RoleEntity,
        ModuleEntity,
        AssignationModuleEntity, UserRoleEntity,
      ],
      'mysql',
    ),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: 'TU_SUPER_SECRET_KEY_IA_CRM',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [TypeOrmModule],
  controllers: [ModuleController],
  providers: [
    ModuleGenerateService,
    FunctionsExecutionsService,
    UserRepository,
    ModuleRepository,
    AssignedRepository,
    IAService,
    GeneratePersistService,
    ExtractPayload,
    ExtractTokenUtils,
    UserExtractUtils,
    PromptUtils,
    ModuleHydratorUtils,
    AuthGuard,
  ],
})
export class ModuleModule {}
