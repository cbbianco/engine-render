import { Controller, Get, Post, Body, Query, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationEntity } from './notification.entity';
import { AuthGuard } from './guards/auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post('/')
  @UseGuards(AuthGuard)
  async create(@Body() data: Partial<NotificationEntity>, @Req() req: any) {
    const user = req.user;
    // Forzamos el autor al ID del usuario en sesión y read explicitamente
    const secureData = { ...data, author: user.userId, read: false };
    return await this.service.createNotification(secureData);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  async findAll(@Req() req: any) {
    const { userId } = req.user;
    return await this.service.getNotifications(userId);
  }

  @Get('/comment-status')
  @UseGuards(AuthGuard)
  async getCommentStatus(@Query('ids') ids: string, @Req() req: any) {
    const { userId } = req.user;
    const resourceIds = ids?.split(',').filter(Boolean) || [];
    
    console.log(`[DEBUG-BACKEND] Consultando checks para Usuario ID: "${userId}"`);
    console.log(`[DEBUG-BACKEND] IDs de recursos a verificar:`, resourceIds);
    
    const result = await this.service.getCommentStatus(resourceIds, userId);
    console.log(`[DEBUG-BACKEND] Resultado enviado a la tabla:`, result);
    return result;
  }

  @Post('/cleanup-manual')
  async cleanup() {
    await this.service.handleCleanup();
    return { success: true, message: 'Cleanup triggered manually' };
  }

  @Patch('/:id/read')
  async markAsRead(@Param('id') id: string) {
    console.log(`[NotificationController] markAsRead ID: ${id}`);
    await this.service.markAsRead(id);
    return { success: true };
  }

  @Patch('/read-all')
  @UseGuards(AuthGuard)
  async markAllAsRead(@Req() req: any) {
    const { userId } = req.user;
    console.log(`[NotificationController] markAllAsRead userId: ${userId}`);
    await this.service.markAllAsRead(userId);
    return { success: true };
  }

  @Post('/tag')
  @UseGuards(AuthGuard)
  async createTag(@Body() dto: any, @Req() req: any) {
    const user = req.user;
    console.log('[NotificationController] Autor (ID) identificado:', user.userId);
    
    // Inyectamos el ID como autor, cumpliendo con la estandarización
    const data = { ...dto, author: user.userId };
    
    console.log('[NotificationController] Procesando tagueo con Author ID:', data.author);
    return await this.service.processTagNotification(data);
  }

  @Get('/comment-detail')
  @UseGuards(AuthGuard)
  async getDetail(@Query('resourceId') resourceId: string, @Req() req: any) {
    const { userId } = req.user;
    return await this.service.getCommentByResourceAndAuthor(resourceId, userId);
  }

  @Get('/config')
  @UseGuards(AuthGuard)
  async getConfig(@Req() req: any) {
    const { userId } = req.user;
    return await this.service.getConfig(userId);
  }

  @Patch('/config')
  @UseGuards(AuthGuard)
  async updateConfig(@Body() body: any, @Req() req: any) {
    const { userId } = req.user;
    return await this.service.updateConfig(userId, body.colors);
  }
}
