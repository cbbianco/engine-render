import { Module } from '@nestjs/common';
import { CustomerController } from './controller/customer.controller';
import { CustomerService } from './service/customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './entity/customer.entity';
import { CustomerRepository } from './repository/customer.repository';
import { AesSecurity } from './commons/security/aes/aes.security';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerEntity]),
    JwtModule.register({
      secret: 'TU_SUPER_SECRET_KEY_IA_CRM',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, AesSecurity, CustomerRepository],
})
export class CustomerModule {}
