import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login/login.dto';
import { ExtractTokenDto } from '../dto/jwt/user.data.dto';
import { UserCreateDto } from '../dto/user/user.create.dto';
import { UserProfileDto } from '../dto/user/user.profile.dto';
import { AuthService } from './auth/auth.service';
import { UserVerificationService } from './user/user-verification.service';
import { UserListService } from './user/user-list.service';
import { UserCreationService } from './user/user-creation.service';
import { UserProfileService } from './user/user-profile.service';

/**
 * @class UserService
 * @description Facade service for User domain operations.
 * Delegating specific responsibilities to specialized services (SRP - SOLID).
 */
@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly verificationService: UserVerificationService,
    private readonly listService: UserListService,
    private readonly creationService: UserCreationService,
    private readonly profileService: UserProfileService,
  ) {}

  /**
   * @method getUserByToken
   * @description Delegates user verification by token.
   */
  async getUserByToken(user: ExtractTokenDto) {
    return this.verificationService.getUserByToken(user);
  }

  /**
   * @method authUser
   * @description Delegates user authentication.
   */
  async authUser(login: LoginDto) {
    return this.authService.authUser(login);
  }

  /**
   * @method updateUser
   * @description Delegates user profile update.
   */
  async updateUser(profile: UserProfileDto, user: ExtractTokenDto) {
    return this.profileService.updateUser(profile, user);
  }

  /**
   * @method createUser
   * @description Delegates user creation.
   */
  async createUser(create: UserCreateDto, currentUser: ExtractTokenDto) {
    return this.creationService.createUser(create, currentUser);
  }

  /**
   * @method getUsersPaginated
   * @description Delegates paginated user retrieval.
   */
  async getUsersPaginated(page: number = 1, limit: number = 10, currentUser?: ExtractTokenDto) {
    return this.listService.getUsersPaginated(page, limit, currentUser);
  }
}
