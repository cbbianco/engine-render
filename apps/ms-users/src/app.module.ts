import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './user/commons/guards/auth.guards';
import { ExtractTokenUtils } from './user/utils/extract/token/extract.token.utils';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserConfigEntity } from './user/entities/config/user.config.entity';
import { UserEntity } from './user/entities/user/user.entity';
import { RoleEntity } from './user/entities/role/role.entity';
import { ModuleEntity } from './user/entities/module/module.entity';
import { UserRoleEntity } from './user/entities/role/user-role.entity';
import { ModuleConfigEntity } from './user/entities/module/module-json.entity';
import { AssignationModuleEntity } from './user/entities/module/assignation-module.entity';

/** Conexión MySQL (datos del antiguo connection.datasource.ts) */
const mysqlConnection = {
  name: 'mysql' as const,
  type: 'mysql' as const,
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
  username: process.env.MYSQL_USERNAME ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? 'ce54rb14nc01986$',
  database: process.env.MYSQL_DATABASE ?? 'db_cmr_solutions',
  entities: [UserEntity, ModuleEntity, UserRoleEntity, RoleEntity, AssignationModuleEntity],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forRoot({
      name: 'mongo',
      type: 'mongodb',
      url: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/solutionsplusone_crm',
      entities: [UserConfigEntity, ModuleConfigEntity],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forRoot(mysqlConnection),
    JwtModule.register({
      global: true,
      secret: 'TU_SUPER_SECRET_KEY_IA_CRM',
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
