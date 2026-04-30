import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleConfigEntity } from './entities/module-json.entity';
import { MongoClient, Db } from 'mongodb';
import * as Ajv from 'ajv';

const ajv = new Ajv.default({ allErrors: true });

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private mongoClient: MongoClient;
  private connectionCache = new Map<string, Db>();

  constructor(
    @InjectRepository(ModuleConfigEntity, 'mongo')
    private readonly moduleRepo: Repository<ModuleConfigEntity>,
  ) {
    this.initMongoClient();
  }

  private async initMongoClient() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.mongoClient = new MongoClient(uri);
    await this.mongoClient.connect();
    this.logger.log('Connected to MongoDB via MongoClient for dynamic dbs');
  }

  /**
   * Obtiene la base de datos dinámica para un customer y stage
   */
  private async getDynamicDb(customerId: string): Promise<Db> {
    const stage = process.env.STAGE || 'dev';
    const dbName = `${customerId}_${stage}_inventory`;
    
    if (this.connectionCache.has(dbName)) {
      return this.connectionCache.get(dbName) as Db;
    }
    
    if (!this.mongoClient) {
      await this.initMongoClient();
    }
    
    const db = this.mongoClient.db(dbName);
    this.connectionCache.set(dbName, db);
    return db;
  }

  /**
   * Genera un esquema AJV a partir de la configuración del módulo
   */
  private buildAjvSchema(schemaConfig: any[]): any {
    const properties: any = {};
    const required: string[] = [];

    schemaConfig.forEach((component) => {
      if (!component.property) return;
      
      let type = 'string';
      if (component.type === 'number') type = 'number';
      if (component.type === 'boolean' || component.type === 'checkbox') type = 'boolean';
      
      properties[component.property] = { type };
      
      // Basic required validation check from component.validation
      if (component.validation?.required) {
        required.push(component.property);
      }
    });

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: true, // Allow additional properties since it's raw
    };
  }

  async saveInventory(customerId: string, moduleId: string, payload: any) {
    // 1. Fetch Module Schema
    let moduleConfig: ModuleConfigEntity;
    try {
      // Usamos findOne en MongoDB TypeORM
      const ObjectId = require('mongodb').ObjectId;
      moduleConfig = (await this.moduleRepo.findOne({ where: { _id: new ObjectId(moduleId) } as any })) as ModuleConfigEntity;
    } catch (e) {
      throw new BadRequestException('Invalid moduleId format');
    }

    if (!moduleConfig) {
      throw new NotFoundException(`Module with id ${moduleId} not found`);
    }

    // 2. Validate payload against schema
    const schemaConfig = moduleConfig.configurationUi?.schema || [];
    const ajvSchema = this.buildAjvSchema(schemaConfig);
    
    const validate = ajv.compile(ajvSchema);
    const valid = validate(payload);
    
    if (!valid) {
      this.logger.warn(`Validation failed for module ${moduleId}: ${ajv.errorsText(validate.errors)}`);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validate.errors
      });
    }

    // 3. Save raw data dynamically
    const db = await this.getDynamicDb(customerId);
    const collectionName = moduleConfig.modulo || 'inventory_raw';
    const collection = db.collection(collectionName);
    
    const docToInsert = {
      ...(typeof payload === 'object' && payload !== null ? payload : {}),
      _moduleId: moduleId,
      createdAt: new Date(),
    };
    
    const result = await collection.insertOne(docToInsert);
    return { success: true, id: result.insertedId };
  }

  async getInventory(customerId: string, moduleId: string, page: number = 1, limit: number = 10) {
     let moduleConfig: ModuleConfigEntity;
     try {
       const ObjectId = require('mongodb').ObjectId;
       moduleConfig = (await this.moduleRepo.findOne({ where: { _id: new ObjectId(moduleId) } as any })) as ModuleConfigEntity;
     } catch (e) {
       throw new BadRequestException('Invalid moduleId format');
     }
 
     if (!moduleConfig) {
       throw new NotFoundException(`Module with id ${moduleId} not found`);
     }

     const db = await this.getDynamicDb(customerId);
     const collectionName = moduleConfig.modulo || 'inventory_raw';
     const collection = db.collection(collectionName);

     const skip = (page - 1) * limit;
     const items = await collection.find({ _moduleId: moduleId }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
     const total = await collection.countDocuments({ _moduleId: moduleId });

     return {
       data: items,
       meta: {
         total,
         page,
         limit,
         totalPages: Math.ceil(total / limit)
       }
     };
  }
}
