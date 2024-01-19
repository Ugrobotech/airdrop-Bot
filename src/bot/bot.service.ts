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
    // Register event listener for incoming button commands
    this.bot.on('callback_query', this.handleButtonCommands);
  }

  // Event handler for incoming messages
  onReceiveMessage = async (msg: any) => {
    this.logger.debug(msg);
    // Create inline keyboard with buttons
    const keyboard = [
      [
        { text: 'Hottest 🔥', callback_data: '/hottest' },
        { text: 'Potential 💡', callback_data: '/potential' },
        { text: 'Latest 📅', callback_data: '/latest' },
      ],
      [
        { text: 'Subscribe 🔄', callback_data: 'subscribe' },
        { text: 'Unsubscribe ❌', callback_data: 'unsubscribe' },
      ],
    ];

    // Set up the keyboard markup
    const replyMarkup = {
      inline_keyboard: keyboard,
    };

    // Parse incoming message and handle commands
    try {
      // this checks for messages that are not text
      if (!msg.text) {
        // Send a message with the inline keyboard
        this.bot.sendMessage(
          msg.chat.id,
          'Invalid command, please Choose an option:',
          {
            reply_markup: replyMarkup,
          },
        );
        // this.sendMessageToUser(
        //   msg.chat.id,
        //   'Unknown command. Please use\n\n' +
        //     '\t /hottest - View hottest 🔥 airdrops\n' +
        //     '\t /potential - View potential 💡 airdrops\n' +
        //     '\t /latest - View latest 📅 airdrops\n\n' +
        //     '\t /subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
        //     `\t /unsubscribe - ❌ To stop getting notification from me`,
        // );
      }
      const command = msg.text.toLowerCase();
      if (command === '/start') {
        // Send a menu of available actions
        await this.sendWelcomeMenu(msg.chat.id);
        // await this.sendMainMenu(msg.chat.id);
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
  sendPictureToUser = async (
    userId: string,
    imageUrl: string,
    message: string,
  ) => {
    try {
      return await this.bot.sendPhoto(userId, imageUrl, {
        parse_mode: 'HTML',
        caption: message,
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
  notifyAllUsers = async (messageId: number) => {
    try {
      const users = await this.databaseService.user.findMany();
      const message = await this.databaseService.airDrops.findFirst({
        where: { id: messageId },
      });
      if (users && message) {
        const sendALL = users.map(async (user) => {
          const options = {
            wordwrap: 130,
            // ...
          };
          const ConvertedText = convert(message.description, options);

          return await this.sendAirdropDetails(
            user.chat_id.toString(),
            message.imageUrl,
            message.name,
            message.network,
            ConvertedText,
            message.category,
            message.steps,
            message.cost,
          );
        });
        return sendALL;
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send the main menu of available actions
  sendMainMenu = async (chatId: string) => {
    // Create inline keyboard with buttons
    const keyboard = [
      [
        { text: 'Hottest 🔥', callback_data: 'hottest' },
        { text: 'Potential 💡', callback_data: 'potential' },
        { text: 'Latest 📅', callback_data: 'latest' },
      ],
      [
        { text: 'Subscribe 🔄', callback_data: 'subscribe' },
        { text: 'Unsubscribe ❌', callback_data: 'unsubscribe' },
      ],
    ];

    // Set up the keyboard markup
    const replyMarkup = {
      inline_keyboard: keyboard,
    };
    try {
      const welcome = await this.sendPictureToUser(
        chatId,
        'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&cs=tinysrgb&w=600',
        'Welcome👋! to AirdropScanBot @SkyDrip_bot.',
      );
      if (welcome) {
        return this.bot.sendMessage(chatId, ' Choose an option:', {
          reply_markup: replyMarkup,
        });
      }

      // await this.sendMessageToUser(chatId, message);
    } catch (error) {
      console.error(error);
    }
  };

  // function to for initial command of the bot
  sendWelcomeMenu = async (chatId: string) => {
    // Create inline keyboard with buttons
    const keyboard = [
      [{ text: 'Subscribe 🔄', callback_data: '/subscribe' }],
      [{ text: 'Join channel 💬', callback_data: '/channel' }],
    ];

    // Set up the keyboard markup
    const replyMarkup = {
      inline_keyboard: keyboard,
    };
    try {
      const welcome = await this.sendPictureToUser(
        chatId,
        'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&cs=tinysrgb&w=600',
        'Welcome👋! to AirdropScanBot @SkyDrip_bot.',
      );
      if (welcome) {
        return this.bot.sendMessage(chatId, ' Choose an option:', {
          reply_markup: replyMarkup,
        });
      }

      // await this.sendMessageToUser(chatId, message);
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
            'picture',
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

  // Method to handle airdrop commands
  handleButtonCommands = async (query: any) => {
    // console.log(query.message.chat.id);
    const chatId = query.message.chat.id;
    const command = query.data;
    console.log(command);
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
            'picture',
          );
          break;
        case '/unsubscribe':
          const unsubscribed = await this.updateUser(query.msg.chat.username, {
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
    imageUrl: string,
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
      return await this.sendPictureToUser(chatId, imageUrl, detailsMessage);
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
            airdrop.imageUrl,
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
            airdrop.imageUrl,
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
            airdrop.imageUrl,
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
