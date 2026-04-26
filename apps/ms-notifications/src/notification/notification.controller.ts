import { Body, Controller, Get, Post, Query, Patch, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationEntity } from './notification.entity';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post('/')
  async create(@Body() data: Partial<NotificationEntity>) {
    return await this.service.createNotification(data);
  }

  @Get('/')
  async findAll(@Query('author') author: string) {
    return await this.service.getNotifications(author);
  }

  @Post('/cleanup-manual')
  async cleanup() {
    await this.service.handleCleanup();
    return { success: true, message: 'Cleanup triggered manually' };
  }

  @Patch('/:id/read')
  async markAsRead(@Param('id') id: string) {
    await this.service.markAsRead(id);
    return { success: true };
  }

  @Patch('/read-all')
  async markAllAsRead(@Query('author') author: string) {
    await this.service.markAllAsRead(author);
    return { success: true };
  }
}
