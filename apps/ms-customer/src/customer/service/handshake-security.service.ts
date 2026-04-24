import { Injectable } from '@nestjs/common';
import { AesSecurity } from '../commons/security/aes/aes.security';
import * as crypto from 'crypto';

@Injectable()
export class HandshakeSecurityService {
  /**
   * Ejecuta el cifrado híbrido (AES + RSA) para el payload de configuración.
   * @param payload Objeto con los datos a cifrar.
   * @param publicKey Llave pública del cliente.
   */
  encryptHandshake(payload: any, publicKey: string) {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // 1. Cifrado simétrico del payload con AES
    const stringPayload = JSON.stringify(payload);
    const encryptedData = AesSecurity.encrypt(stringPayload, aesKey, iv);

    // 2. Cifrado asimétrico de la llave AES con RSA
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    const encryptedKey = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      aesKey,
    );

    return {
      encryptedData,
      encryptedKey: encryptedKey.toString('base64'),
      iv: iv.toString('hex'),
    };
  }
}
