import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [DatabaseModule, BotModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
