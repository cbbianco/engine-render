import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RsaSecurity {
  static generateRSAKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const cleanPublicKey = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s+/g, '');

    const cleanPrivateKey = privateKey
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s+/g, '');

    return { publicKey: cleanPublicKey, privateKey: cleanPrivateKey };
  }

  /**
   * @method decrypt
   * @description Decrypts data using a private RSA key.
   * 
   * @param encryptedData - Base64 encoded encrypted string.
   * @param privateKey - The private key (PEM format or clean string).
   * @returns {string} The decrypted plaintext.
   */
  static decrypt(encryptedData: string, privateKey: string): string {
    try {
      if (!privateKey) return '';

      // Asegurar el formato PEM para crypto.privateDecrypt
      const formattedKey = privateKey.includes('BEGIN PRIVATE KEY')
        ? privateKey
        : `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;

      const buffer = Buffer.from(encryptedData, 'base64');
      const decrypted = crypto.privateDecrypt(
        {
          key: formattedKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        buffer,
      );
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('[RsaSecurity] Error en desencriptación RSA:', error.message);
      return '';
    }
  }
}
