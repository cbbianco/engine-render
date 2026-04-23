import { MongoRepository } from 'typeorm';
import { CustomerEntity } from '../entity/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly authRepository: MongoRepository<CustomerEntity>,
  ) { }

  /**
   * @method consultCustomer
   * @description Consults a customer based on their domain.
   * 
   * @param {string} domain
   * @returns {Promise<CustomerEntity>}
   * @throws {UnauthorizedException}
   */

  async consultCustomer(domain: string): Promise<CustomerEntity> {
    const config: CustomerEntity | null = await this.authRepository.findOneBy({
      customer: domain,
    });

    if (!config) {
      throw new UnauthorizedException('Cliente no encontrado');
    }

    return config;
  }
}
