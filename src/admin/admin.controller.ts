import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Query,
  Get,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { BotService } from 'src/bot/bot.service';
import { Prisma } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly botService: BotService,
  ) {}

  @Post()
  async createAirdrop(@Body() createAirdropDto: Prisma.AirDropsCreateInput) {
    return this.adminService.createAirdrop(createAirdropDto);
  }

  @Patch(':id')
  async updateAirdrop(
    @Param('id') id: string,
    @Body() updateAirdropDto: Prisma.AirDropsUpdateInput,
  ) {
    return this.adminService.update(+id, updateAirdropDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.adminService.delete(+id);
  }
  @Get()
  async findAll(
    @Query('category') category?: 'LATEST' | 'HOTTEST' | 'POTENTIAL',
  ) {
    return this.adminService.findAll(category);
  }
  @Get(':id')
  async notifyAll(
    @Param('id') id: string,
    @Query('wishlist') wishlist?: 'wishlist',
  ) {
    const _id = +id;
    if (wishlist) {
      return this.botService.notifyWishlist(_id);
    }
    return this.botService.notifyAllUsers(_id);
  }

  @Get('users')
  async getAllUsers() {
    return await this.adminService.getAllUsers();
  }
  @Get('subs')
  async getAllSubUsers() {
    return await this.adminService.getSubUserCount();
  }
}
