// Import necessary modules and dependencies
import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { convert } from 'html-to-text';

// Replace with your actual Telegram Bot token
const TELEGRAM_TOKEN = '6772341762:AAFD7W55yv9i2OMUqnPb8hKOa6X-zXsuvqY';

@Injectable()
export class BotService {
  /**
   * 2 create a service to fetch datas from the db
   */
  private readonly bot: TelegramBot;
  private logger = new Logger(BotService.name);

  constructor(private readonly databaseService: DatabaseService) {
    // Initialize the Telegram bot with polling
    this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

    // Register event listener for incoming messages
    this.bot.on('message', this.onReceiveMessage);
  }

  // Event handler for incoming messages
  onReceiveMessage = async (msg: any) => {
    this.logger.debug(msg);

    // Parse incoming message and handle commands

    try {
      if (!msg.text) {
        // this checks for messages that are not text
        this.sendMessageToUser(
          msg.chat.id,
          'Unknown command. Please use\n\n' +
            '\t /hottest - View hottest 🔥 airdrops\n' +
            '\t /potential - View potential 💡 airdrops\n' +
            '\t /latest - View latest 📅 airdrops\n\n' +
            '\t /subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
            `\t /unsubscribe - ❌ To stop getting notification from me`,
        );
      }
      const command = msg.text.toLowerCase();
      if (command === '/start') {
        // Send a menu of available actions
        await this.sendMainMenu(msg.chat.id);
        await this.saveToDB({
          username: msg.chat.username,
          first_name: msg.chat.first_name,
          chat_id: msg.chat.id,
        });
      } else {
        // Handle other commands
        this.handleAirdropCommands(msg);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Method to  save a new userdata to the database
  async saveToDB(saveUserDto: Prisma.UserCreateInput) {
    try {
      const isSaved = await this.databaseService.user.findFirst({
        where: { username: saveUserDto.username },
      });
      if (!isSaved) {
        return this.databaseService.user.create({ data: saveUserDto });
      }
      return;
    } catch (error) {
      console.error(error);
    }
  }
  // method to subscribe a user
  async updateUser(username: string, updateUserDto: Prisma.UserUpdateInput) {
    return await this.databaseService.user.update({
      where: { username },
      data: updateUserDto,
    });
  }

  // Method to  fetch airdrops from the database
  async fetchAirdrops(category: 'LATEST' | 'HOTTEST' | 'POTENTIAL') {
    try {
      return await this.databaseService.airDrops.findMany({
        where: { category },
      });
    } catch (error) {
      console.error(error);
    }
  }
  // Method to send a picture message to a specific user
  sendPictureToUser = async (userId: string, imageUrl: string) => {
    try {
      return await this.bot.sendPhoto(userId, imageUrl, {
        parse_mode: 'HTML',
        caption:
          'Unknown command. Please use\n\n' +
          '\t /hottest - View hottest 🔥 airdrops\n' +
          '\t /potential - View potential 💡 airdrops\n' +
          '\t /latest - View latest 📅 airdrops\n\n' +
          '\t /subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
          `\t /unsubscribe - ❌ To stop getting notification from me`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send a message to a specific user
  sendMessageToUser = async (userId: string, message: string) => {
    try {
      return await this.bot.sendMessage(userId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send a broadcast massage to all users
  sendToAllUsers = async (userIds: string[], message: string) => {
    try {
      const sendALL = userIds.map(async (user) => {
        return await this.bot.sendMessage(user, message);
      });
      return sendALL;
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send the main menu of available actions
  sendMainMenu = async (chatId: string) => {
    try {
      const message =
        'Welcome👋! to AirdropBot @SkyDrip_bot. Choose an action:\n' +
        '/hottest - View hottest 🔥 airdrops\n' +
        '/potential - View potential 💡 airdrops\n' +
        '/latest - View latest 📅 airdrops\n\n' +
        '/subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
        `/unsubscribe - ❌ To stop getting notification from me`;
      return await this.sendMessageToUser(chatId, message);
    } catch (error) {
      console.error(error);
    }
  };

  // Method to handle airdrop commands
  handleAirdropCommands = async (msg: any) => {
    const chatId = msg.chat.id;
    const command = msg.text.toLowerCase();
    try {
      switch (command) {
        case '/hottest':
          const hottest = await this.sendHottestAirdrops(chatId);
          if (hottest) break;
        case '/potential':
          const potential = await this.sendPotentialAirdrops(chatId);
          if (potential) break;
        case '/latest':
          const latest = await this.sendLatestAirdrops(chatId);
          if (latest) break;
        case '/subscribe':
          // const suscribed = await this.updateUser(msg.chat.username, {
          //   subscribed: true,
          // });
          // if (suscribed) {
          //   return await this.sendMessageToUser(
          //     chatId,
          //     'you have successfully subscribed to our services',
          //   );

          //   break;
          // }
          return await this.sendPictureToUser(
            chatId,
            'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&cs=tinysrgb&w=600',
          );
          break;
        case '/unsubscribe':
          const unsubscribed = await this.updateUser(msg.chat.username, {
            subscribed: false,
          });
          if (unsubscribed) {
            return await this.sendMessageToUser(
              chatId,
              'You have successfuly unsunscribed from our services',
            );
            break;
          }
          break;

        // Add more cases for other airdrop categories as needed
        default:
          // Handle unknown commands or provide instructions
          return await this.sendMessageToUser(
            chatId,
            'Unknown command. Please use\n\n' +
              '\t /hottest - View hottest 🔥 airdrops\n' +
              '\t /potential - View potential 💡 airdrops\n' +
              '\t /latest - View latest 📅 airdrops\n\n' +
              '\t /subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
              `\t /unsubscribe - ❌ To stop getting notification from me`,
          );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send detailed information about a specific airdrop
  sendAirdropDetails = async (
    chatId: string,
    airdropName: string,
    network?: string,
    details?: string,
    category?: string,
    steps?: string,
    cost?: string,
  ) => {
    try {
      const detailsMessage = `${airdropName}\n\n
    ${network}.\n${details}.\n\n\t${steps}\n\n\tCost: ${cost}`;
      return await this.sendMessageToUser(chatId, detailsMessage);
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send information about the hottest airdrops
  sendHottestAirdrops = async (chatId: string) => {
    try {
      const message = await this.sendMessageToUser(
        chatId,
        '🔥 Hottest Airdrops 👇',
      );

      if (message) {
        const hottestAirDrops = await this.fetchAirdrops('HOTTEST');
        const hotDrops = hottestAirDrops.map(async (airdrop) => {
          const options = {
            wordwrap: 130,
            // ...
          };
          const ConvertedText = convert(airdrop.description, options);

          return await this.sendAirdropDetails(
            chatId,
            airdrop.name,
            airdrop.network,
            ConvertedText,
            airdrop.category,
            airdrop.steps,
            airdrop.cost,
          );
        });
        return hotDrops;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send information about potential airdrops
  sendPotentialAirdrops = async (chatId: string) => {
    try {
      const message = await this.sendMessageToUser(
        chatId,
        '💡 Potential Airdrops 👇',
      );
      if (message) {
        const potentialAirDrops = await this.fetchAirdrops('POTENTIAL');
        const potDrops = potentialAirDrops.map(async (airdrop) => {
          const options = {
            wordwrap: 130,
            // ...
          };
          const ConvertedText = convert(airdrop.description, options);
          return await this.sendAirdropDetails(
            chatId,
            airdrop.name,
            airdrop.network,
            ConvertedText,
            airdrop.category,
            airdrop.steps,
            airdrop.cost,
          );
        });

        return potDrops;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send information about the latest airdrops
  sendLatestAirdrops = async (chatId: string) => {
    try {
      const message = await this.sendMessageToUser(
        chatId,
        '📅 Latest Airdrops 👇',
      );
      if (message) {
        const latestAirDrops = await this.fetchAirdrops('LATEST');

        const latestDrops = latestAirDrops.map(async (airdrop) => {
          const options = {
            wordwrap: 130,
            // ...
          };
          const ConvertedText = convert(airdrop.description, options);
          return await this.sendAirdropDetails(
            chatId,
            airdrop.name,
            airdrop.network,
            ConvertedText,
            airdrop.category,
            airdrop.steps,
            airdrop.cost,
          );
        });
        return latestDrops;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };
}
