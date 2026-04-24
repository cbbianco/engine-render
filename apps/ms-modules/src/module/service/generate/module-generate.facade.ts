import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ModuleRequestDto } from '../../dto/module/module-request.dto';
import { ExtractTokenDto, UserDomainDTO } from '../../dto/jwt/user.data.dto';
import { UserExtractUtils } from '../../utils/extract/user/user.extract.utils';
import { UserRepository } from '../../repository/user/user.repository';
import { ModuleRepository } from '../../repository/modules/module.repository';
import { IAService } from '../commons/ia.service';
import { ModelResponseDto } from '../../dto/response/model.response.dto';

@Injectable()
export class ModuleGenerateFacade {
  constructor(
    private readonly repositoryUser: UserRepository,
    private readonly repositoryModule: ModuleRepository,
    private readonly extractUser: UserExtractUtils,
    private readonly ia: IAService,
    @InjectDataSource('mysql') private readonly dataSource: DataSource,
  ) {}

  /**
   * @method generateJson
   * @description Fachada para orquestar la generación de módulos con IA y persistencia SQL bajo transacción.
   */
  async generateJson(
    generate: ModuleRequestDto,
    user: ExtractTokenDto,
  ): Promise<ModelResponseDto | undefined> {
    
    // 1. Contexto de Usuario
    const userToken: UserDomainDTO = await this.extractUser.extractUser(user);
    const consultUser = await this.repositoryUser.consultUser(userToken.userName);

    if (!consultUser || !generate) {
      throw new BadRequestException('Usuario o datos de generación no válidos');
    }

    let moduleResponse: ModelResponseDto = new ModelResponseDto();
    moduleResponse.message = 'Modulo generado satisfactoriamente';

    try {
      console.log('[ModuleGenerateFacade] Iniciando generación de JSON con IA...');
      
      // 2. Generación vía IA (Capa Especializada)
      const iaResult = await this.ia.generateJson(generate, consultUser.id);
      
      if (!iaResult?.id) {
        console.warn('[ModuleGenerateFacade] La IA no retornó un ID de módulo');
        return { ...iaResult, message: 'No se pudo generar el modulo' };
      }

      moduleResponse = iaResult;

      // 3. Persistencia en SQL bajo transacción (Capa de Orquestación)
      console.log('[ModuleGenerateFacade] IA completada. Iniciando transacción SQL...');
      await this.persistModuleRegistration(moduleResponse, generate, consultUser, user);
      console.log('[ModuleGenerateFacade] Proceso finalizado con éxito');

      return moduleResponse;

    } catch (error) {
      console.error('[ModuleGenerateFacade] Error en el flujo:', error.message);
      moduleResponse.message = `Hubo un error: ${error.message}`;
      return moduleResponse;
    }
  }

  private async persistModuleRegistration(
    module: ModelResponseDto,
    generate: ModuleRequestDto,
    userEntity: any,
    userToken: ExtractTokenDto
  ) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!module.id) {
        throw new Error('ID de módulo no disponible para persistencia SQL');
      }

      console.log('[ModuleGenerateFacade] Registrando en base SQL...');
      await this.repositoryModule.insertModule(queryRunner, {
        path: generate.configurationUi.config.path,
        method: generate.configurationUi.config.method,
        order: generate.configurationUi.config.order,
        uuid: module.id.toString(),
        pathActive: 1,
        name: generate.configurationUi.config.module,
        roles: [userEntity.userRoles[0].role],
        createdBy: userToken.content[userEntity.userName]?.userName ?? 'SystemAdmin',
      });

      await queryRunner.commitTransaction();
      console.log('[ModuleGenerateFacade] Transacción SQL confirmada');
    } catch (error) {
      console.error('[ModuleGenerateFacade] Error SQL, aplicando rollback:', error.message);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
