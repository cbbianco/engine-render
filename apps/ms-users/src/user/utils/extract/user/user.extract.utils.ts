import { Injectable } from '@nestjs/common';
import { ExtractTokenDto, UserDomainDTO } from '../../../dto/jwt/user.data.dto';

@Injectable()
export class UserExtractUtils {

  /**
   * @method extractUser
   * @description Extract the user of token
   *
   * @param user
   */
  async extractUser(user: ExtractTokenDto): Promise<UserDomainDTO> {
    const entry = Object.entries(user.content)[0];

    const userData = entry[1];

    return Object.entries(userData).reduce((acc, [key, value]) => {
      if (acc.hasOwnProperty(key) || key in acc) {
        acc[key] = value;
      }
      return acc;
    }, new UserDomainDTO());
  }
}
