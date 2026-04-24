import { Injectable } from '@nestjs/common';
import { AuthRequestDto } from '../dto/auth.request.dto';
import { CustomerRepository } from '../repository/customer.repository';
import { CustomerEntity } from '../entity/customer.entity';
import { JwtService } from '@nestjs/jwt';
import { HandshakeSecurityService } from './handshake-security.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly repository: CustomerRepository,
    private readonly securityService: HandshakeSecurityService,
  ) { }

  /**
   * @method getConfigCustomer
   * @description Fachada para la obtención de configuración del cliente con Handshake seguro.
   */
  async getConfigCustomer(customer: AuthRequestDto): Promise<any> {
    // 1. Recuperación de datos de dominio
    const customerFinder: CustomerEntity = await this.repository.consultCustomer(customer.domain);

    // 2. Preparación de Payload
    const payload = {
      cid: customerFinder.id,
      mail: customerFinder.customer,
      publicKey: customerFinder.publicKey,
      iat: Date.now(),
    };

    // 3. Orquestación de Cifrado Híbrido (Delegado a SecurityService)
    const { encryptedData, encryptedKey, iv } = this.securityService.encryptHandshake(
      payload, 
      customerFinder.publicKey
    );

    // 4. Construcción de Respuesta
    return {
      userName: customerFinder.userName,
      loginTexts: customerFinder.loginTexts,
      css: customerFinder.colorCss,
      logo: customerFinder.logo,
      serverPublicKey: customerFinder.publicKey,
      access_token: this.jwtService.sign({
        content: encryptedData,
        envelope: encryptedKey,
        iv: iv,
      }),
    };
  }
}
