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
    const notification = this.repo.create(data);
    return await this.repo.save(notification);
  }

  async findAll(author?: string): Promise<NotificationEntity[]> {
    const filter = author ? { author } : {};
    return await this.repo.find({
      where: filter,
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
    await this.repo.update(id, { read });
  }

  async markAllAsReadByAuthor(author: string): Promise<void> {
    await this.repo.updateMany({ author, read: false }, { $set: { read: true } });
  }
}
