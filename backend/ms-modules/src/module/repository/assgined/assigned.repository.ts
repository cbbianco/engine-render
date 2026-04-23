import { Injectable } from '@nestjs/common';
import { AssignationModuleEntity } from '../../entities/module/assing-module.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AssignedRepository {
  constructor(
    @InjectRepository(AssignationModuleEntity, 'mysql')
    private readonly repositoryAssignation: Repository<AssignationModuleEntity>,
  ) {}

  /**
   * @method consultAssignations
   * @description consult the modules assigned
   */
  async consultAssignations(
    whereOptions: any,
  ): Promise<Array<AssignationModuleEntity> | []> {
    return this.repositoryAssignation.find({
      where: whereOptions,
    });
  }

  /**
   * @method consultAssignation
   * @description consult the modules assigned
   */
  async consultAssignation(
    whereOptions: any,
  ): Promise<AssignationModuleEntity | null> {
    return this.repositoryAssignation.findOne({
      where: whereOptions,
    });
  }

  /**
   * @method saveAssignation
   * @description Handler the assignment of module
   *
   * @param userId
   * @param moduleId
   */
  async saveAssignation(
    userId: number,
    moduleId: number,
  ): Promise<AssignationModuleEntity> {
    return this.repositoryAssignation.save({
      moduleId: moduleId,
      userId: userId,
      isActive: 1,
      createdBy: 'SystemAdmin',
    });
  }
}