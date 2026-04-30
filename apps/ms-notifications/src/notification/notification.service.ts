import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationRepository } from './notification.repository';
import { NotificationEntity } from './notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationConfigEntity } from './notification-config.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly repository: NotificationRepository,
    @InjectRepository(NotificationConfigEntity, 'mongo')
    private readonly configRepo: Repository<NotificationConfigEntity>,
  ) {}

  async createNotification(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
    return await this.repository.create(data);
  }

  async getNotifications(userId: string): Promise<NotificationEntity[]> {
    return await this.repository.findForUser(userId);
  }

  /**
   * Determina cuáles de los recursos proporcionados ya tienen un comentario por parte del usuario.
   */
  async getCommentStatus(resourceIds: string[], userId: string): Promise<Record<string, boolean>> {
    const notifications = await this.repository.findByResourcesAndAuthor(resourceIds, userId);
    
    const statusMap: Record<string, boolean> = {};
    resourceIds.forEach(id => {
      statusMap[id] = notifications.some(n => n.metadata?.resourceId === id);
    });
    
    return statusMap;
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

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.markAllAsReadByUser(userId);
  }

  async processTagNotification(dto: any) {
    this.logger.log(`Procesando notificación de tagueo: ${JSON.stringify(dto)}`);
    const { resourceId, moduleName, message, author } = dto;

    try {
      this.logger.log(`DEBUG: Iniciando persistencia para recurso ${resourceId} y autor ${author}`);
      
      // Limpiar notificaciones previas de este autor para este recurso (para soporte de edición)
      await this.repository.deleteByResourceAndAuthor(resourceId, author, 'tagueo');
      this.logger.log('DEBUG: Borrado previo completado');

      // 3. SIEMPRE creamos un registro base del comentario para asegurar la persistencia
      this.logger.log('DEBUG: Creando registro base de comentario...');
      const baseComment = await this.repository.create({
        type: 'tagueo',
        title: `Comentario en ${moduleName}`,
        message: message,
        author: author,
        targetUserId: undefined,
        metadata: {
          resourceId,
          moduleName,
        }
      });
      this.logger.log(`DEBUG: Registro base guardado con éxito. ID: ${baseComment.id}`);

      // 4. Procesar menciones (si vienen del frontend)
      const mentions = dto.mentions || [];
      this.logger.log(`DEBUG: Procesando ${mentions.length} menciones directas enviadas por el frontend`);

      if (mentions.length > 0) {
        for (const mention of mentions) {
          try {
            const targetId = String(mention.id || mention._id);
            const taggedUser = mention.userName || 'usuario';
            
            this.logger.log(`DEBUG: Creando notificación dirigida para @${taggedUser} (ID: ${targetId})...`);
            
            await this.repository.create({
              type: 'tagueo',
              title: `Mención en ${moduleName}`,
              message: message,
              author: author,
              targetUserId: targetId,
              metadata: {
                resourceId,
                moduleName,
                taggedUser
              }
            });
          } catch (error) {
            this.logger.error(`DEBUG: Error procesando mención para ID ${mention.id}: ${error.message}`);
          }
        }
      }

      return { success: true, debug: dto };
    } catch (error) {
      this.logger.error(`Error en processTagNotification: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  async getCommentByResourceAndAuthor(resourceId: string, author: string) {
    return await this.repository.findOneByResourceAndAuthor(resourceId, author, 'tagueo');
  }

  async getConfig(userId: string) {
    const config = await this.configRepo.findOne({ where: { userId } as any });
    return config || { colors: {} };
  }

  async updateConfig(userId: string, colors: any) {
    let config = await this.configRepo.findOne({ where: { userId } as any });
    if (!config) {
      config = this.configRepo.create({ userId, colors });
    } else {
      config.colors = { ...config.colors, ...colors };
    }
    return await this.configRepo.save(config);
  }
}
