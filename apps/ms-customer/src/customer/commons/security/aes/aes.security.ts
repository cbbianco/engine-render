import * as crypto from 'crypto';

export class AesSecurity {
  private static readonly ALGORITHM = 'aes-256-cbc';

  static encrypt(text: string, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
}
