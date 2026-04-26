import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationRepository } from './notification.repository';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly repository: NotificationRepository) {}

  async createNotification(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
    return await this.repository.create(data);
  }

  async getNotifications(author?: string): Promise<NotificationEntity[]> {
    return await this.repository.findAll(author);
  }

  /**
   * Tarea programada que se dispara cada 24 horas.
   * Elimina notificaciones con más de 7 días de antigüedad.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('[EDP] Iniciando limpieza programada de notificaciones antiguas (> 7 días)...');
    const deletedCount = await this.repository.deleteOldNotifications(7);
    this.logger.log(`[EDP] Limpieza completada. Se eliminaron ${deletedCount} notificaciones.`);
  }

  async markAsRead(id: string): Promise<void> {
    await this.repository.updateReadStatus(id, true);
  }

  async markAllAsRead(author: string): Promise<void> {
    await this.repository.markAllAsReadByAuthor(author);
  }
}
