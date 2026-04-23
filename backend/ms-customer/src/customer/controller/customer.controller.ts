import { Body, Controller, Post } from '@nestjs/common';
import { CustomerService } from '../service/customer.service';
import { AuthRequestDto } from '../dto/auth.request.dto';

@Controller()
export class CustomerController {
  constructor(private readonly appService: CustomerService) { }

  /**
   * @method getConfigCustomer
   * @description Handles the validation of a customer.
   * 
   * @param {AuthRequestDto} customer
   * @returns {any}
   */
  @Post('customer')
  getConfigCustomer(@Body() customer: AuthRequestDto): any {
    return this.appService.getConfigCustomer(customer);
  }
}
