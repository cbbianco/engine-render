import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRequestDto } from '../../dto/module/module-request.dto';
import { ExtractTokenDto, UserDomainDTO } from '../../dto/jwt/user.data.dto';
import { UserRepository } from '../../repository/user/user.repository';
import { UserEntity } from '../../entities/user/user.entity';
import { ModuleRepository } from '../../repository/modules/module.repository';
import { IAService } from '../commons/ia.service';
import { 
  ModelResponseDto, 
  PathResponseDto, 
  ConsultModuleResponseDto, 
  BaseModuleConfig 
} from '../../dto/response/model.response.dto';
import { CreateAssignationDto } from '../../dto/module/create-assignation.dto';
import { ConstantsUtils } from '../../utils/constants/constants.utils';
import { ModuleEntity } from '../../entities/module/module.entity';
import { AssignedRepository } from '../../repository/assgined/assigned.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { AssignationModuleEntity } from '../../entities/module/assing-module.entity';
import { UserExtractUtils } from '../../utils/extract/user/user.extract.utils';

@Injectable()
export class ModuleGenerateService {
  constructor(
    private readonly repositoryUser: UserRepository,
    private readonly repositoryModule: ModuleRepository,
    private readonly repositoryAssigned: AssignedRepository,
    private readonly extractUser: UserExtractUtils,
    private readonly ia: IAService,
    @InjectDataSource('mysql') private readonly dataSource: DataSource,
  ) { }

  /**
   * @method consultModule
   * @description Consult the modules associated
   */
  async consultModule(user: ExtractTokenDto): Promise<ConsultModuleResponseDto> {
    const userToken: UserDomainDTO = await this.extractUser.extractUser(user);

    const consultUser: UserEntity | null =
      await this.repositoryUser.consultUser(userToken.userName);

    if (consultUser) {
      const moduleAssigned: Array<AssignationModuleEntity> = await this.repositoryAssigned.consultAssignations({
        userId: consultUser.id,
      });

      if (moduleAssigned.length > 0) {
        const modules: BaseModuleConfig[] = [];
        const paths: PathResponseDto[] = [];
        
        for (const assigned of moduleAssigned) {
          const moduleEntity: ModuleEntity | null =
            await this.repositoryModule.consultModules({
              id: assigned.moduleId,
            });

          if (moduleEntity) {
            const mongoResult = await this.repositoryModule.consultJsonModuleGenerated(
              moduleEntity.uuid,
            );

            if (mongoResult.length > 0) {
              const mongoData = mongoResult[0] as any;
              
              // 1. Extraer path para la raíz
              const path: PathResponseDto = {
                path: moduleEntity.path,
                method: moduleEntity.method,
                order: moduleEntity.order,
                pathActive: moduleEntity.pathActive,
              };
              paths.push(path);

              // 2. Preparar módulo base (sin el campo path interno)
              const { path: _, ...moduleBase } = mongoData; // Limpiar si existe (aunque en mongo no suele estar)
              modules.push(moduleBase as BaseModuleConfig);
            }
          }
        }

        return {
          modules,
          path: paths,
        };
      } else {
        throw new NotFoundException(ConstantsUtils.MODULE_NOT_FOUND);
      }
    }

    throw new NotFoundException(ConstantsUtils.USER_NOT_FOUND);
  }

  /**
   * @method assignationModule
   * @description Handler the assignment of module
   *
   * @param assignation
   */
  async assignationModule(
    assignation: CreateAssignationDto,
  ): Promise<ModelResponseDto | null> {
    const modules: ModuleEntity | null =
      await this.repositoryModule.consultModules({
        uuid: assignation.moduleId,
      });

    if (!modules || !modules?.id) {
      throw new NotFoundException(ConstantsUtils.MODULE_NOT_FOUND);
    }

    const consultUser: UserEntity | null =
      await this.repositoryUser.consultUser(assignation.domain);
    if (consultUser) {
      const moduleAssigned = await this.repositoryAssigned.consultAssignation(
        {
          userId: consultUser.id,
          moduleId: modules.id,
        }
      );

      if (moduleAssigned) {
        throw new ForbiddenException(ConstantsUtils.ASSIGNATION_ALREADY_EXISTS);
      }

      await this.repositoryAssigned.saveAssignation(consultUser.id, modules.id);

      return {
        message: 'Asignacion de modulo exitosa',
      };
    }

    throw new NotFoundException(ConstantsUtils.USER_NOT_FOUND);
  }

  /**
   * @method generateJson
   * @description Handler the generation of json
   * //TODO Cambiar a Transacciones
   *
   * @param generate
   * @param user
   */
  async generateJson(
    generate: ModuleRequestDto,
    user: ExtractTokenDto,
  ): Promise<ModelResponseDto | undefined> {

    const userToken: UserDomainDTO = await this.extractUser.extractUser(user);

    let module: ModelResponseDto = new ModelResponseDto();
    module.message = 'Modulo generado satisfactoriamente';

    const consultUser: UserEntity | null =
      await this.repositoryUser.consultUser(userToken.userName);

    if (consultUser && generate) {
      try {
        console.log('[ModuleGenerateService] Iniciando generación de JSON con IA...');
        module = await this.ia.generateJson(generate, consultUser.id);
        
        if (!module?.id) {
          module.message = 'No se pudo generar el modulo';
          console.warn('[ModuleGenerateService] La IA no retornó un ID de módulo');
          return module;
        }

        console.log('[ModuleGenerateService] IA retornó exitosamente. Preparando transacción SQL...');
        
        // 2. Transacción SQL SOLO después de tener los datos de la IA
        const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          console.log('[ModuleGenerateService] Registrando en base SQL...');
          await this.repositoryModule.insertModule(queryRunner, {
            path: generate.configurationUi.config.path,
            method: generate.configurationUi.config.method,
            order: generate.configurationUi.config.order,
            uuid: module.id.toString(),
            pathActive: 1,
            name: generate.configurationUi.config.module,
            roles: [consultUser.userRoles[0].role],
            createdBy:
              user.content[consultUser.userName]?.userName ?? 'SystemAdmin',
          });
          console.log('[ModuleGenerateService] Registro SQL completado');
        } catch (dbError) {
          console.error('[ModuleGenerateService] Error en transacción SQL:', dbError.message);
          throw dbError; // Capturado por el catch exterior
        } finally {
          await queryRunner.release();
        }

      } catch (e) {
        console.error('[ModuleGenerateService] Error capturado:', e.message);
        module.message = `Hubo un error: ${e.message}`;
      }
    }

    console.log('[ModuleGenerateService] Finalizando proceso de generación');
    return module;
  }
}
