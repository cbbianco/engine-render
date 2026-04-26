import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
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
    ScheduleModule.forRoot(),
    NotificationModule,
  ],
})
export class AppModule {}
