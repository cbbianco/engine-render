import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './customer/entity/customer.entity';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb://localhost:27017/solutionsplusone_crm',
      entities: [CustomerEntity],
      synchronize: false,
      logging: true,
    }),
    CustomerModule,
  ],
})
export class AppModule {}
