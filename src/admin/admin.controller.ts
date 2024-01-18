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
import { Prisma } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  @Get('users')
  async getAllUsers() {
    return await this.adminService.getAllUsers();
  }
  @Get('subs')
  async getAllSubUsers() {
    return await this.adminService.getSubUserCount();
  }
}
