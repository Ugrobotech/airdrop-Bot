import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    BotModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
