import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { ExtractTokenDto, UserDomainDTO } from '../../dto/jwt/user.data.dto';
import { UserExtractUtils } from '../../utils/extract/user/user.extract.utils';
import { UserEntity } from '../../entities/user/user.entity';

@Injectable()
export class UserVerificationService {
  constructor(
    private readonly authRepository: UserRepository,
    private readonly extractUser: UserExtractUtils,
  ) {}

  /**
   * @method getUserByToken
   * @description Handler the data of a user and his verification
   * 
   * @param {ExtractTokenDto} user 
   * @returns {Promise<any>}
   */
  async getUserByToken(user: ExtractTokenDto) {
    const userToken: UserDomainDTO = await this.extractUser.extractUser(user);

    const consultUser: UserEntity | null =
      await this.authRepository.getUserAndPermissions(userToken.userName);

    if (!consultUser) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return {
      data: {
        message: 'Usuario Verificado',
        userName: consultUser.userName,
        firstName: consultUser.firstName,
        lastName: consultUser.lastName,
      }
    };
  }
}
