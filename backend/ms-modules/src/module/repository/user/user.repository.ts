import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../entities/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity, 'mysql')
    private readonly repositoryUser: Repository<UserEntity>
  ) {}

  /**
   * @method consultUser
   * @description Handler the validation of user
   *
   * @param domain
   */

  async consultUser(domain: string): Promise<UserEntity | null> {
    return this.repositoryUser
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('user.userName = :userName', { userName: domain })
      .getOne();
  }
}
