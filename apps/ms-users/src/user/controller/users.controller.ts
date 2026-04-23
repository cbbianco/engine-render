import { Body, Controller, Get, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../service/user.service';
import { LoginDto } from '../dto/login/login.dto';
import { AuthGuard } from '../commons/guards/auth.guards';
import { PasswordDecryptionInterceptor } from '../commons/interceptors/password-decryption.interceptor';
import { DecryptPassword } from '../commons/decorators/decrypt-password.decorator';
import { ExtractTokenDto } from '../dto/jwt/user.data.dto';
import { UserProfileDto } from '../dto/user/user.profile.dto';
import { UserCreateDto } from '../dto/user/user.create.dto';

@Controller('users')
@UseInterceptors(PasswordDecryptionInterceptor)
export class UsersController {
  constructor(private readonly userService: UserService) { }

  /**
   * @method  auth
   * @description Handler the authentication of module
   *
   * @param {LoginDto} login
   */
  @DecryptPassword()
  @Post('auth')
  auth(@Body() login: LoginDto): unknown {
    return this.userService.authUser(login);
  }

  /**
   * @method  logout
   * @description Handler the authentication of module when module wants to log out
   *
   * @param logOut
   */
  @Put('log-out')
  logout(@Body() logOut: LoginDto): unknown {
    return null;
  }

  /**
   * @method  findAll
   * @description List all users with pagination
   * 
   * @param {string} page
   * @param {string} limit
   */
  @UseGuards(AuthGuard)
  @Get('/')
  findAll(
    @Query('page') page: string, 
    @Query('limit') limit: string,
    @Req() request: Request
  ): unknown {
    return this.userService.getUsersPaginated(
      Number(page) || 1, 
      Number(limit) || 10, 
      request['user'] as ExtractTokenDto
    );
  }

  /**
   * @method  getProfile
   * @description Handler the data of the current authenticated user 
   * 
   * @param {Request} request
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() request: Request): unknown {
    return this.userService.getUserByToken(request['user'] as ExtractTokenDto);
  }

  /**
   * @method  updateProfile
   * @description Handler the update of the data user (password)
   *
   * @param {UserProfileDto} user
   * @param {Request} request
   */
  @UseGuards(AuthGuard)
  @DecryptPassword()
  @Put('profile')
  updateProfile(@Body() user: UserProfileDto, @Req() request: Request): unknown {
    return this.userService.updateUser(user, request['user'] as ExtractTokenDto);
  }

  /**
   * @method  create
   * @description Handler the creation of a new user
   *
   * @param {UserCreateDto} user
   * @param {Request} request
   */
  @UseGuards(AuthGuard)
  @DecryptPassword()
  @Post('/')
  create(@Body() user: UserCreateDto, @Req() request: Request): unknown {
    return this.userService.createUser(user, request['user'] as ExtractTokenDto);
  }
}
