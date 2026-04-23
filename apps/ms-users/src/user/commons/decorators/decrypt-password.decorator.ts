import { SetMetadata } from '@nestjs/common';

export const DECRYPT_PASSWORD_KEY = 'decrypt_password';
export const DecryptPassword = () => SetMetadata(DECRYPT_PASSWORD_KEY, true);
