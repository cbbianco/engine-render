import * as crypto from 'crypto';

export class AesSecurity {
  private static readonly ALGORITHM = 'aes-256-cbc';

  static decrypt(encryptedText: string, key: Buffer, iv: Buffer): string {
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
