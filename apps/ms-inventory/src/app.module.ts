import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { InventoryModule } from './inventory/inventory.module';
import { ModuleConfigEntity } from './inventory/entities/module-json.entity';

@Module({
  imports: [
    // MongoDB Connection to main CRM DB to fetch modules configurations
    TypeOrmModule.forRoot({
      name: 'mongo',
      type: 'mongodb',
      url: process.env.MONGODB_URI || 'mongodb://localhost:27017/solutionsplusone_crm',
      entities: [ModuleConfigEntity],
      synchronize: false,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'TU_SUPER_SECRET_KEY_IA_CRM',
      signOptions: { expiresIn: '1h' },
    }),
    ScheduleModule.forRoot(),
    InventoryModule,
  ],
})
export class AppModule {}
