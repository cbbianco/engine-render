import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { ModuleGuard } from '../commons/guards/module.guard';

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
  @UseGuards(AuthGuard, ModuleGuard)
  @DecryptPassword()
  @Put('profile')
  updateProfile(
    @Body() body: Record<string, unknown>, 
    @Req() request: Request,
  ): unknown {
    return this.userService.updateUser(body, request['user'] as ExtractTokenDto, request['moduleId'] as string);
  }

  /**
   * @method  findAll
   */
  @UseGuards(AuthGuard)
  @Get('/:moduleId')
  findAll(
    @Param('moduleId') moduleId: string,
    @Query('page') page: string, 
    @Query('limit') limit: string,
    @Req() request: Request
  ): unknown {
    return this.userService.getUsersPaginated(
      Number(page) || 1, 
      Number(limit) || 10, 
      request['user'] as ExtractTokenDto,
      moduleId
    );
  }

  /**
   * @method  delete
   */
  @UseGuards(AuthGuard)
  @Delete('/:id')
  delete(@Param('id') id: string): unknown {
    return this.userService.deleteUser(Number(id));
  }

  /**
   * @method  update
   * @description Handles general user updates
   */
  @UseGuards(AuthGuard, ModuleGuard)
  @DecryptPassword()
  @Put('/')
  update(
    @Body() body: Record<string, unknown>, 
    @Req() request: Request
  ): unknown {
    return this.userService.update(body, request['moduleId'] as string);
  }

  /**
   * @method  create
   * @description Handler the creation of a new user with optional logo file
   */
  @UseGuards(AuthGuard, ModuleGuard)
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
    @Body() body: Record<string, unknown>, 
    @Req() request: Request,
    @UploadedFile() file?: Express.Multer.File
  ): unknown {
    if (file) {
      body[file.fieldname] = file.path;
    }
    return this.userService.createUser(body, request['user'] as ExtractTokenDto, request['moduleId'] as string);
  }

  /**
   * @method findByUserName
   * @description Finds a user by their username.
   */
  @Get('username/:userName')
  findByUserName(@Param('userName') userName: string): unknown {
    console.log(`[ms-users] Buscando usuario por userName: "${userName}"`);
    return this.userService.findUserByUserName(userName);
  }

  /**
   * @method search
   * @description Searches for users by query.
   */
  @UseGuards(AuthGuard)
  @Get('search/find')
  search(@Query('q') query: string): unknown {
    return this.userService.searchUsers(query || '');
  }

  /**
   * @method getMentions
   * @description Returns a simplified list of all users for tagging.
   */
  @UseGuards(AuthGuard)
  @Get('mentions/all')
  getMentions(): unknown {
    return this.userService.findAllForMentions();
  }
}
