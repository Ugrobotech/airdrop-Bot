import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createAirdrop(createAirdropDto: Prisma.AirDropsCreateInput) {
    return await this.databaseService.airDrops.create({
      data: createAirdropDto,
    });
  }

  async update(id: number, updateAirdropDto: Prisma.AirDropsUpdateInput) {
    return await this.databaseService.airDrops.update({
      where: { id },
      data: updateAirdropDto,
    });
  }

  async delete(id: number) {
    return this.databaseService.airDrops.delete({ where: { id } });
  }

  async findAll(category?: 'LATEST' | 'HOTTEST' | 'POTENTIAL') {
    if (category)
      return await this.databaseService.airDrops.findMany({
        where: { category },
      });
    return await this.databaseService.airDrops.findMany();
  }

  async getSubUserCount() {
    return await this.databaseService.user.count({
      where: { subscribed: true },
    });
  }

  async getAllUsers() {
    return await this.databaseService.user.count();
  }
}
