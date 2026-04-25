import { Body, Controller, Get, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
   */
  @DecryptPassword()
  @Post('auth')
  auth(@Body() login: LoginDto): unknown {
    return this.userService.authUser(login);
  }

  /**
   * @method  logout
   */
  @Put('log-out')
  logout(@Body() logOut: LoginDto): unknown {
    return null;
  }

  /**
   * @method  findAll
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
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() request: Request): unknown {
    return this.userService.getUserByToken(request['user'] as ExtractTokenDto);
  }

  /**
   * @method  updateProfile
   */
  @UseGuards(AuthGuard)
  @DecryptPassword()
  @Put('profile')
  updateProfile(@Body() user: UserProfileDto, @Req() request: Request): unknown {
    return this.userService.updateUser(user, request['user'] as ExtractTokenDto);
  }

  /**
   * @method  create
   * @description Handler the creation of a new user with optional logo file
   */
  @UseGuards(AuthGuard)
  @DecryptPassword()
  @Post('/')
  @UseInterceptors(FileInterceptor('logoFile', {
    storage: diskStorage({
      destination: './uploads/logos',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  create(
    @Body() user: UserCreateDto, 
    @Req() request: Request,
    @UploadedFile() file?: Express.Multer.File
  ): unknown {
    if (file) {
      user['logoPath'] = file.path;
    }
    return this.userService.createUser(user, request['user'] as ExtractTokenDto);
  }
}
