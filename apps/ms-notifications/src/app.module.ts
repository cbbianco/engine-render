import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule, NotificationEntity } from './notification';

@Module({
  imports: [
    // MongoDB Connection
    TypeOrmModule.forRoot({
      name: 'mongo',
      type: 'mongodb',
      url: 'mongodb://localhost:27017/solutionsplusone_crm',
      entities: [NotificationEntity],
      synchronize: false,
    }),
    JwtModule.register({
      global: true,
      secret: 'TU_SUPER_SECRET_KEY_IA_CRM',
      signOptions: { expiresIn: '1h' },
    }),
    ScheduleModule.forRoot(),
    NotificationModule,
  ],
})
export class AppModule {}
