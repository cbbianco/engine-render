import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, LessThan } from 'typeorm';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity, 'mongo')
    private readonly repo: MongoRepository<NotificationEntity>,
  ) {}

  async create(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
    console.log('[NotificationRepository] Guardando datos:', JSON.stringify(data, null, 2));
    const result = await this.repo.save(data as any);
    console.log('[NotificationRepository] Resultado guardado:', JSON.stringify(result, null, 2));
    return result;
  }

  async findForUser(userId: string): Promise<NotificationEntity[]> {
    // Buscamos: 
    // 1. Tagueos dirigidos a mí (targetUserId === userId)
    // 2. Comentarios que yo escribí (author === userId AND targetUserId === null)
    return await this.repo.find({
      where: {
        $or: [
          { targetUserId: userId },
          { author: userId, targetUserId: null }
        ]
      },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async deleteOldNotifications(days: number): Promise<number> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    
    // En MongoDB con TypeORM, a veces es mejor usar el driver nativo para borrados masivos complejos
    const result = await this.repo.deleteMany({
      createdAt: { $lt: dateLimit }
    });
    
    return result.deletedCount || 0;
  }

  async updateReadStatus(id: string, read: boolean): Promise<void> {
    try {
      const { ObjectId } = require('mongodb');
      const objId = new ObjectId(id);
      console.log(`[NotificationRepository] updateReadStatus ObjectID: ${objId}`);
      await this.repo.updateMany({ _id: objId }, { $set: { read } });
    } catch (e) {
      console.error(`[NotificationRepository] Error updateReadStatus: ${e.message}`);
    }
  }

  async markAllAsReadByUser(userId: string): Promise<void> {
    const filter = {
      $or: [
        { targetUserId: userId },
        { author: userId, targetUserId: null },
        { author: userId, targetUserId: { $exists: false } }
      ],
      read: false
    };
    console.log(`[NotificationRepository] markAllAsReadByUser Filter:`, JSON.stringify(filter));
    const result = await this.repo.updateMany(filter as any, { $set: { read: true } });
    console.log(`[NotificationRepository] markAllAsReadByUser Result: ${result?.modifiedCount} modified`);
  }

  async findByResource(resourceId: string, type?: string): Promise<NotificationEntity[]> {
    const filter: any = { metadata: { resourceId } };
    if (type) filter.type = type;
    return await this.repo.find({ where: filter });
  }

  async findOneByResourceAndAuthor(resourceId: string, author: string, type: string): Promise<NotificationEntity | null> {
    const authorId = String(author);
    const resId = String(resourceId);

    return await this.repo.findOne({
      where: {
        author: authorId,
        type,
        $or: [
          { 'metadata.resourceId': resId },
          { 'metadata.resource_id': resId }
        ]
      } as any,
    });
  }

  async deleteByResourceAndAuthor(resourceId: string, author: string, type: string): Promise<void> {
    const authorId = String(author);
    const resId = String(resourceId);

    await this.repo.deleteMany({
      author: authorId,
      type,
      $or: [
        { 'metadata.resourceId': resId },
        { 'metadata.resource_id': resId }
      ]
    } as any);
  }

  async findManyByResources(resourceIds: string[]): Promise<NotificationEntity[]> {
    return await this.repo.find({
      where: {
        metadata: { resourceId: { $in: resourceIds } },
        type: 'tagueo'
      }
    });
  }

  async findByResourcesAndAuthor(resourceIds: string[], userId: string): Promise<NotificationEntity[]> {
    const authorId = String(userId);
    const ids = resourceIds.map(id => String(id));
    
    return await this.repo.find({
      where: {
        author: authorId,
        $or: [
          { 'metadata.resourceId': { $in: ids } },
          { 'metadata.resource_id': { $in: ids } }
        ]
      } as any
    });
  }
}
