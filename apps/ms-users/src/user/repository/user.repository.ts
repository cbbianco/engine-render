import { MongoRepository, Repository } from 'typeorm';
import { UserConfigEntity } from '../entities/config/user.config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../entities/user/user.entity';
import { ModuleEntity } from '../entities/module/module.entity';
import { ModuleConfigEntity } from '../entities/module/module-json.entity';
import { ObjectId } from 'mongodb';

import { UserRoleEntity } from '../entities/role/user-role.entity';
import { RoleEntity } from '../entities/role/role.entity';
import { AssignationModuleEntity } from '../entities/module/assignation-module.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserConfigEntity, 'mongo')
    private readonly authRepository: MongoRepository<UserConfigEntity>,
    @InjectRepository(ModuleConfigEntity, 'mongo')
    private readonly moduleMongoRepository: MongoRepository<ModuleConfigEntity>,
    @InjectRepository(UserEntity, 'mysql')
    private readonly repository: Repository<UserEntity>,
    @InjectRepository(ModuleEntity, 'mysql')
    private readonly moduleRepository: Repository<ModuleEntity>,
    @InjectRepository(RoleEntity, 'mysql')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity, 'mysql')
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    @InjectRepository(AssignationModuleEntity, 'mysql')
    private readonly assignationRepository: Repository<AssignationModuleEntity>,
  ) { }

  /**
   * @method consultUser
   * @description Consults user configuration based on their domain.
   * 
   * @param {string} domain
   * @returns {Promise<UserConfigEntity>}
   * @throws {UnauthorizedException}
   */
  async consultUser(domain: string): Promise<UserConfigEntity> {
    console.log(
      '[UserRepository.consultUser] Buscando customer en BD:',
      domain,
    );
    const config: UserConfigEntity | null = await this.authRepository.findOneBy(
      {
        userName: domain,
      },
    );

    if (!config) {
      console.log(
        '[UserRepository.consultUser] No existe documento con customer:',
        domain,
      );
      throw new UnauthorizedException('Cliente no encontrado');
    }

    return config;
  }

  /**
   * @method getUserAndPermissions
   * @description Retrieves a user along with their roles, permissions, and associated modules.
   * 
   * @param {string} userName
   * @returns {Promise<UserEntity | null>}
   */
  async getUserAndPermissions(userName: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('role.modules', 'module')
      .where('user.userName = :userName', { userName })
      .getOne();
  }

  /**
   * @method saveUser
   * @description Persists a user entity to the MySQL database.
   * 
   * @param {UserEntity} user
   * @returns {Promise<UserEntity>}
   */
  async saveUser(user: UserEntity): Promise<UserEntity> {
    return this.repository.save(user);
  }

  /**
   * @method updateMongoConfig
   * @description Updates the customer field in the MongoDB customers collection.
   * 
   * @param {string} oldCustomer
   * @param {string} newCustomer
   * @returns {Promise<void>}
   */
  async updateMongoConfig(oldCustomer: string, newCustomer: string): Promise<void> {
    await this.authRepository.update({ userName: oldCustomer }, { userName: newCustomer });
  }

  /**
   * @method findModuleByName
   * @description Retrieves a module by its name from MySQL.
   * 
   * @param {string} name
   * @returns {Promise<ModuleEntity | null>}
   */
  async findModuleByName(name: string): Promise<ModuleEntity | null> {
    return this.moduleRepository.findOneBy({ name });
  }

  /**
   * @method findModuleByUuid
   * @description Retrieves a module by its UUID from MySQL.
   * 
   * @param {string} uuid
   * @returns {Promise<ModuleEntity | null>}
   */
  async findModuleByUuid(uuid: string): Promise<ModuleEntity | null> {
    return this.moduleRepository.findOneBy({ uuid });
  }

  /**
   * @method getModuleConfig
   * @description Retrieves the module configuration from MongoDB using its UUID.
   * 
   * @param {string} uuid
   * @returns {Promise<ModuleConfigEntity | null>}
   */
  async getModuleConfig(uuid: string): Promise<ModuleConfigEntity | null> {
    try {
      return this.moduleMongoRepository.findOneBy({
        _id: new ObjectId(uuid),
      });
    } catch (e) {
      return null;
    }
  }

  /**
   * @method findRoleByName
   * @description Retrieves a role by its name from MySQL.
   * 
   * @param {string} name
   * @returns {Promise<RoleEntity | null>}
   */
  async findRoleByName(name: string): Promise<RoleEntity | null> {
    return this.roleRepository.findOneBy({ name });
  }

  /**
   * @method saveUserRole
   * @description Persists a user-role relationship to MySQL.
   * 
   * @param {UserRoleEntity} userRole
   * @returns {Promise<UserRoleEntity>}
   */
  async saveUserRole(userRole: UserRoleEntity): Promise<UserRoleEntity> {
    return this.userRoleRepository.save(userRole);
  }

  /**
   * @method findUserByUserName
   * @description Retrieves a user by their userName from MySQL.
   * 
   * @param {string} userName
   * @returns {Promise<UserEntity | null>}
   */
  async findUserByUserName(userName: string): Promise<UserEntity | null> {
    return this.repository.findOneBy({ userName });
  }

  /**
   * @method findAllPaginated
   * @description Retrieves users with pagination.
   * 
   * @param {number} skip
   * @param {number} take
   * @returns {Promise<[UserEntity[], number]>}
   */
  async findAllPaginated(skip: number, take: number): Promise<[UserEntity[], number]> {
    return this.repository.findAndCount({
      skip,
      take,
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  /**
   * @method saveUserConfig
   * @description Persists a user configuration to MongoDB.
   * 
   * @param {UserConfigEntity} config
   * @returns {Promise<UserConfigEntity>}
   */
  async saveUserConfig(config: UserConfigEntity): Promise<UserConfigEntity> {
    return this.authRepository.save(config);
  }

  /**
   * @method findUserById
   * @description Retrieves a user by their ID from MySQL.
   */
  async findUserById(id: number): Promise<UserEntity | null> {
    return this.repository.findOneBy({ id } as any);
  }

  /**
   * @method deleteModuleAssignations
   * @description Deletes all module assignations for a user.
   */
  async deleteModuleAssignations(userId: number): Promise<void> {
    await this.assignationRepository.delete({ userId });
  }

  /**
   * @method deleteUserRoles
   * @description Deletes all roles assigned to a user.
   */
  async deleteUserRoles(userId: number): Promise<void> {
    await this.userRoleRepository.delete({ userId });
  }

  /**
   * @method deleteUserConfig
   * @description Deletes user configuration from MongoDB.
   */
  async deleteUserConfig(userName: string): Promise<void> {
    await this.authRepository.delete({ userName });
  }

  /**
   * @method deleteUser
   * @description Deletes a user from MySQL.
   */
  async deleteUser(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * @method findModuleAssignationsByUserId
   * @description Retrieves all module assignments for a user, including module details.
   */
  async findModuleAssignationsByUserId(userId: number): Promise<AssignationModuleEntity[]> {
    return this.assignationRepository.find({
      where: { userId },
      relations: ['module']
    });
  }

  /**
   * @method deleteModuleConfigByUuid
   * @description Deletes a module configuration from MongoDB using its UUID.
   */
  async deleteModuleConfigByUuid(uuid: string): Promise<void> {
    try {
      await this.moduleMongoRepository.delete({ _id: new ObjectId(uuid) } as any);
    } catch (e) {
      console.error('[UserRepository.deleteModuleConfigByUuid] Error deleting from Mongo:', uuid, e.message);
    }
  }

  /**
   * @method deleteModuleById
   * @description Deletes a module from MySQL.
   */
  async deleteModuleById(id: number): Promise<void> {
    await this.moduleRepository.delete(id);
  }
}
