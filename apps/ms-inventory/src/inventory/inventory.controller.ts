import { Controller, Post, Get, Body, Query, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '@nestjs/passport'; // Assumes passport is used if token validated

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async saveInventory(
    @Body('customerId') customerId: string,
    @Body('moduleId') moduleId: string,
    @Body('payload') payload: any,
  ) {
    if (!customerId || !moduleId || !payload) {
      return { statusCode: 400, message: 'customerId, moduleId and payload are required' };
    }
    return this.inventoryService.saveInventory(customerId, moduleId, payload);
  }

  @Get()
  async getInventory(
    @Query('customerId') customerId: string,
    @Query('moduleId') moduleId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    if (!customerId || !moduleId) {
      return { statusCode: 400, message: 'customerId and moduleId are required in query' };
    }
    return this.inventoryService.getInventory(
      customerId, 
      moduleId, 
      page ? parseInt(page, 10) : 1, 
      limit ? parseInt(limit, 10) : 10
    );
  }
}
