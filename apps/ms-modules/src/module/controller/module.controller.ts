import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ModuleGenerateService } from '../service/generate/module-generate.service';
import { ModuleGenerateFacade } from '../service/generate/module-generate.facade';
import { ModuleRequestDto } from '../dto/module/module-request.dto';
import { CreateAssignationDto } from '../dto/module/create-assignation.dto';
import { RoleEnum } from '../dto/enums/role.enum';
import { Roles, RolesGuard } from '../commons/guards/role/role.guards';

@Controller('module')
@UseGuards(RolesGuard)
export class ModuleController {
  constructor(
    private readonly moduleGenerateService: ModuleGenerateService,
    private readonly moduleFacade: ModuleGenerateFacade
  ) { }

  /**
   * @method  generateJson
   * @description Handler the generation of module
   *
   */
  @Post('/generate')
  @Roles(RoleEnum.SUPERADMIN)
  generateJson(
    @Body() generate: ModuleRequestDto,
    @Req() request: Request,
  ): unknown {
    return this.moduleFacade.generateJson(generate, request['user']);
  }

  /**
   * @method  createAssignation
   * @description Assignation of module
   *
   */
  @Post('/assignation')
  @Roles(RoleEnum.SUPERADMIN)
  createAssignation(@Body() assignation: CreateAssignationDto): unknown {
    return this.moduleGenerateService.assignationModule(assignation);
  }

  /**
   * @method  consultModule
   * @description Assignation of module
   *
   */
  @Get('/')
  consultModule(@Req() request: Request): unknown {
    return this.moduleGenerateService.consultModule(request['user']);
  }
}
