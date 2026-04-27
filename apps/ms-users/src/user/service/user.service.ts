import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login/login.dto';
import { ExtractTokenDto } from '../dto/jwt/user.data.dto';
import { AuthService } from './auth/auth.service';
import { UserVerificationService } from './user/user-verification.service';
import { UserListService } from './user/user-list.service';
import { UserCreationService } from './user/user-creation.service';
import { UserProfileService } from './user/user-profile.service';
import { UserDeleteService } from './user/user-delete.service';
import { UserUpdateService } from './user/user-update.service';

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
    private readonly deleteService: UserDeleteService,
    private readonly updateService: UserUpdateService,
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
  async updateUser(profile: Record<string, unknown>, user: ExtractTokenDto, moduleId?: string) {
    return this.profileService.updateUser(profile, user, moduleId);
  }

  /**
   * @method createUser
   * @description Delegates user creation.
   */
  async createUser(create: Record<string, unknown>, currentUser: ExtractTokenDto, moduleId?: string, logoFile?: Express.Multer.File) {
    return this.creationService.createUser(create, currentUser, moduleId, logoFile);
  }

  /**
   * @method getUsersPaginated
   * @description Delegates paginated user retrieval.
   */
  async getUsersPaginated(page: number = 1, limit: number = 10, currentUser?: ExtractTokenDto, moduleId?: string) {
    return this.listService.getUsersPaginated(page, limit, currentUser, moduleId);
  }

  /**
   * @method deleteUser
   * @description Delegates user deletion.
   */
  async deleteUser(id: number) {
    return this.deleteService.deleteUser(id);
  }

  /**
   * @method update
   * @description Delegates user update.
   */
  async update(profile: Record<string, unknown>, moduleId?: string) {
    return this.updateService.updateUser(profile, moduleId);
  }

  /**
   * @method findUserByUserName
   * @description Delegates retrieval of a user by username.
   */
  async findUserByUserName(userName: string) {
    return this.listService.findUserByUserName(userName);
  }

  /**
   * @method searchUsers
   * @description Delegates user search.
   */
  async searchUsers(query: string) {
    return this.listService.searchUsers(query);
  }

  /**
   * @method findAllForMentions
   * @description Delegates retrieval of all users for tagging.
   */
  async findAllForMentions() {
    return this.listService.findAllForMentions();
  }
}
