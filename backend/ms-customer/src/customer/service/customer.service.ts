import { Injectable } from '@nestjs/common';
import { AuthRequestDto } from '../dto/auth.request.dto';
import { CustomerRepository } from '../repository/customer.repository';
import { CustomerEntity } from '../entity/customer.entity';
import { AesSecurity } from '../commons/security/aes/aes.security';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomerService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly repository: CustomerRepository,
  ) { }

  /**
   * @method getConfigCustomer
   * @description Handles the validation of a customer.
   * 
   * @param {AuthRequestDto} customer
   * @returns {Promise<any>}
   */
  async getConfigCustomer(customer: AuthRequestDto): Promise<any> {
    const customerFinder: CustomerEntity =
      await this.repository.consultCustomer(customer.domain);

    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const payload = JSON.stringify({
      cid: customerFinder.id,
      mail: customerFinder.customer,
      publicKey: customerFinder.publicKey,
      iat: Date.now(),
    });

    const encryptedData = AesSecurity.encrypt(payload, aesKey, iv);

    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${customerFinder.publicKey}\n-----END PUBLIC KEY-----`;

    const encryptedKey = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      aesKey,
    );

    return {
      userName: customerFinder.userName,
      loginTexts: customerFinder.loginTexts,
      css: customerFinder.colorCss,
      logo: customerFinder.logo,
      serverPublicKey: customerFinder.publicKey,
      access_token: this.jwtService.sign({
        content: encryptedData,
        envelope: encryptedKey.toString('base64'),
        iv: iv.toString('hex'),
      }),
    };
  }
}
