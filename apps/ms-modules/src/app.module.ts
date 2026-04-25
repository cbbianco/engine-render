import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './module/commons/auth/jwt.strategy.autt';
import { APP_GUARD } from '@nestjs/core';
import { ExtractTokenUtils } from './module/utils/extract/token/extract.token.utils';
import { ModuleModule } from './module/module.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './module/commons/guards/auth/auth.guards';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GenerateJsonDto } from './module/dto/jwt/generate-json.dto';
import { ModuleEntity } from './module/entities/module/module.entity';
import { RoleEntity } from './module/entities/role/role.entity';
import { UserEntity } from './module/entities/user/user.entity';
import { UserRoleEntity } from './module/entities/role/user-role.entity';
import { ModuleConfigEntity } from './module/entities/module/module-json.entity';
import { AssignationModuleEntity } from './module/entities/module/assing-module.entity';

/** Conexión MySQL (datos del antiguo connection.datasource.ts) */
const mysqlConnection = {
  name: 'mysql' as const,
  type: 'mysql' as const,
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
  username: process.env.MYSQL_USERNAME ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? 'ce54rb14nc01986$',
  database: process.env.MYSQL_DATABASE ?? 'db_cmr_solutions',
  entities: [
    ModuleEntity,
    RoleEntity,
    UserRoleEntity,
    AssignationModuleEntity, UserEntity,
  ],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};

@Module({
  imports: [
    ModuleModule,
    PassportModule,
    TypeOrmModule.forRoot({
      name: 'mongo',
      type: 'mongodb',
      url:
        process.env.MONGODB_URI ??
        'mongodb://localhost:27017/solutionsplusone_crm',
      entities: [GenerateJsonDto, ModuleConfigEntity],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forRoot(mysqlConnection),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '1h' },
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    JwtStrategy,
    AuthGuard,
    ExtractTokenUtils,
  ],
})
export class AppModule { }
