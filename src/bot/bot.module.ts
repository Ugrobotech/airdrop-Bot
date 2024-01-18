import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { DatabaseModule } from 'src/database/database.module';
// import { BotController } from './bot.controller';

@Module({
  // controllers: [BotController],
  imports: [DatabaseModule],
  providers: [BotService],
})
export class BotModule {}
