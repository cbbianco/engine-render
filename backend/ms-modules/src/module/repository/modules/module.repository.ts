import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, QueryRunner, Repository } from 'typeorm';
import { ModuleEntity } from '../../entities/module/module.entity';
import { ModuleConfigEntity } from '../../entities/module/module-json.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class ModuleRepository {
  constructor(
    @InjectRepository(ModuleConfigEntity, 'mongo')
    private readonly repositoryMongo: MongoRepository<ModuleConfigEntity>,
    @InjectRepository(ModuleEntity, 'mysql')
    private readonly repository: Repository<ModuleEntity>,
  ) {}

  /**
   * @method insertModule
   * @description Handler the insertion of module
   *
   * @param module
   * @param queryRunner
   */
  async insertModule(
    queryRunner: QueryRunner,
    module: Partial<ModuleEntity>,
  ): Promise<ModuleEntity> {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedModule = await queryRunner.manager.save(ModuleEntity, module);
      await queryRunner.commitTransaction();
      return savedModule;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  /**
   * @method consultModules
   * @description consult the modules created
   *
   * @param whereOption
   *
   */
  async consultModules(whereOption: any): Promise<ModuleEntity | null> {
    return this.repository.findOne({
      where: whereOption,
    });
  }

  /**
   * @method consultJsonModuleGenerated
   * @description Consult the json de un module assigned
   *
   * @param id
   */
  async consultJsonModuleGenerated(
    id: string,
  ): Promise<Array<ModuleConfigEntity> | []> {
    console.log(`Ejecutando búsqueda en Mongo para _id: "${id}"`);

    return await this.repositoryMongo.find({
      where: {
        _id: new ObjectId(id),
      },
    });
  }
}
