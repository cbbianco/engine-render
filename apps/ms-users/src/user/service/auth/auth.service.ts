import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RsaSecurity } from '../../commons/security/rsa/rsa.security';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../../dto/login/login.dto';
import { UserRepository } from '../../repository/user.repository';
import { PayloadService } from '../payload/payload.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../entities/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: UserRepository,
    private readonly payload: PayloadService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * @method decryptPassword
   * @description Decrypts a password that was encrypted using RSA Public Key in the frontend.
   *
   * @param encryptedData - Base64 encoded encrypted string.
   * @param privateKey - The private key corresponding to the public key used.
   * @returns {Promise<string>} The plaintext password.
   */
  async decryptPassword(encryptedData: string, privateKey: string): Promise<string> {
    try {
      if (!privateKey) {
        console.warn('[AuthService] No se proporcionó llave privada para descifrar.');
        return encryptedData;
      }

      const result = RsaSecurity.decrypt(encryptedData, privateKey);
      return result;
    } catch (e) {
      console.error('[AuthService] Error al desencriptar password con RSA:', e.message);
      return '';
    }
  }

  /**
   * @method comparePassword
   * @description Compara las password para verificar si son iguales o no.
   *
   * @param password
   * @param hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password.trim(), hash);
  }

  /**
   * @method hashPassword
   * @description Hashes a password using bcrypt.
   *
   * @param password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password.trim(), salt);
  }

  /**
   * @method authUser
   * @description Handler the authentication of User
   * 
   * @param {LoginDto} login 
   * @returns {Promise<any>}
   */
  async authUser(login: LoginDto) {
    let checkPassword = false;
    let payloadUser: Record<string, any> = {};

    // Consultar configuración (Mongo)
    const config = await this.authRepository.consultUser(login.userName);

    // Consultar usuario (MySQL)
    const consultUser: UserEntity | null =
      await this.authRepository.getUserAndPermissions(login.userName);

    if (!consultUser) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    checkPassword = await this.comparePassword(
      login.password,
      consultUser.password,
    );

    if (!config || !checkPassword) {
      throw new UnauthorizedException(
        !checkPassword
          ? 'Usuario o contraseña incorrectos'
          : 'Configuración de usuario no encontrada',
      );
    }

    payloadUser = await this.payload.generatePayload(consultUser, config.publicKey);

    const iv = crypto.randomBytes(16);
    return {
      data: {
        access_token: this.jwtService.sign({
          content: payloadUser,
          iv: iv.toString('hex'),
        }),
        publicKey: config.publicKey,
      }
    };
  }
}
