import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { AesSecurity } from '../../commons/security/aes/aes.security';

@Injectable()
export class ExtractPayload {
  extractPayload(user: any, privateKey: string): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { content, envelope, iv } = user;

    const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;

    const recoveredAesKey = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256', // Debe coincidir con el hash usado al cifrar
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Buffer.from(envelope, 'base64'),
    );

    const decryptedData = AesSecurity.decrypt(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      content,
      recoveredAesKey,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Buffer.from(iv, 'hex'),
    );

    return JSON.parse(decryptedData);
  }
}
