// Import necessary modules and dependencies
import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { convert } from 'html-to-text';

// Replace with your actual Telegram Bot token
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

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
      [{ text: 'view wishList 🛒', callback_data: '/view_wishlist' }],
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
      console.log('command :', command);
      if (command === '/start') {
        const chat_Id = +msg.chat.id;
        // Send a menu of available actions
        await this.sendWelcomeMenu(msg.chat.id);
        // await this.sendMainMenu(msg.chat.id);
        await this.saveToDB({
          username: msg.chat.username,
          first_name: msg.chat.first_name,
          chat_id: chat_Id,
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

  // Method to  save a new userdata to the database
  async saveToWishlist(owner_Id: number, airdrop_Id: number) {
    try {
      const isAdded = await this.databaseService.wishlists.findFirst({
        where: { airdropId: airdrop_Id, ownerId: owner_Id },
      });
      if (!isAdded) {
        return await this.databaseService.wishlists.create({
          data: {
            owner: { connect: { id: owner_Id } },
            airdrop: { connect: { id: airdrop_Id } },
          },
        });
      }
      return 'exist';
    } catch (error) {
      console.error(error);
    }
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
    markup?: TelegramBot.InlineKeyboardMarkup,
  ) => {
    try {
      return await this.bot.sendPhoto(userId, imageUrl, {
        parse_mode: 'HTML',
        caption: message,
        reply_markup: markup,
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
            message.id,
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

  // Method to send a broadcast massage to all users about a coin in thier wishlist
  notifyWishlist = async (airdrop_Id: number) => {
    try {
      const users = await this.databaseService.wishlists.findMany({
        where: { airdropId: airdrop_Id },
        include: { owner: true },
      });
      const message = await this.databaseService.airDrops.findFirst({
        where: { id: airdrop_Id },
      });
      if (users && message) {
        // const usersArray = users
        const sendALL = users.map(async (user) => {
          const options = {
            wordwrap: 130,
            // ...
          };
          const ConvertedText = convert(message.description, options);

          return await this.sendAirdropDetails(
            user.owner.chat_id.toString(),
            message.id,
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
      [{ text: 'Hottest 🔥 Airdrops', callback_data: '/hottest' }],
      [{ text: 'Potential 💡 Airdrops', callback_data: '/potential' }],
      [{ text: 'Latest  📅  Airdrops', callback_data: '/latest' }],
      [{ text: 'view wishList 🛒', callback_data: '/view_wishlist' }],
    ];

    // Set up the keyboard markup
    const replyMarkup = {
      inline_keyboard: keyboard,
    };
    try {
      return this.bot.sendMessage(
        chatId,
        '👍 Use the commands below to scan through Airdrops:',
        {
          reply_markup: replyMarkup,
        },
      );

      // await this.sendMessageToUser(chatId, message);
    } catch (error) {
      console.error(error);
    }
  };

  // function to for initial command of the bot
  sendWelcomeMenu = async (chatId: string) => {
    const keyboard = [
      [
        {
          text: 'Get started with me 🚀',
          callback_data: '/getstarted',
        },
      ],
    ];

    // Set up the keyboard markup
    //force_reply: true,
    const replyMarkup = {
      inline_keyboard: keyboard,
    };
    try {
      return await this.sendPictureToUser(
        chatId,
        'https://ibb.co/L1Ps4jx',
        'Welcome👋! to AirdropScanBot @Airdrop_ScanBot, your go-to airdrop scanner! 🚀',
        replyMarkup,
      );

      // await this.sendMessageToUser(chatId, message);
    } catch (error) {
      console.error(error);
    }
  };

  // function for menu
  sendMenu = async (chatId: string) => {
    // Create inline keyboard with buttons
    const keyboard = [
      [
        {
          text: 'Subscribe to channel 💬',
          url: 'https://t.me/CryptoJamil',
        },
      ],
      [{ text: 'Enable Notification 🔔', callback_data: '/subscribe' }],
      [{ text: `Done ? ✅`, callback_data: '/done' }],
    ];

    // Set up the keyboard markup
    //force_reply: true,
    const replyMarkup = {
      inline_keyboard: keyboard,
    };
    try {
      return await this.bot.sendMessage(
        chatId,
        ' 📝 To utilize the airdrop scanning feature, kindly subscribe to our Telegram channel and enable notification services.:',
        { reply_markup: replyMarkup },
      );

      // await this.sendMessageToUser(chatId, message);
    } catch (error) {
      console.error(error);
    }
  };

  // function to check if a user have succefully suscribed and joined the group
  checkDone = async (chatId: string, userId: number) => {
    // Create inline keyboard with buttons
    const keyboard = [
      [
        {
          text: 'Subscribe to channel 💬',
          url: 'https://t.me/CryptoJamil',
        },
      ],
      [{ text: 'Enable Notification 🔔', callback_data: '/subscribe' }],
      [{ text: `Done ? ✅`, callback_data: '/done' }],
    ];

    // Set up the keyboard markup
    const replyMarkup = {
      inline_keyboard: keyboard,
    };
    console.log('I am here');
    try {
      //-1002136597023
      //-1002116374739 cryptoJamil
      const groupId = -1002116374739;
      const user_Id = userId;
      console.log('user id :', user_Id);
      const chat_Id = +chatId;
      console.log('chat id :', chat_Id);
      let isMember: boolean;
      // Check if the user is a member of the group
      // const isMember = await this.bot.getChatMember(groupId, user_Id);

      this.bot
        .getChatMember(groupId, userId)
        .then((member) => {
          if (
            member.status === 'member' ||
            member.status === 'administrator' ||
            member.status === 'creator'
          ) {
            isMember = true;
            console.log('status :', member.status);
          } else {
            isMember = false;
          }
        })
        .catch((e) => {
          if (e.response.body.error_code == 400) {
            console.log('does not exist :', e.response.body);
            isMember = false;
          }
        });
      // console.log('this is a memeber :', isMember);
      const isSubbed = await this.databaseService.user.findFirst({
        where: { chat_id: chat_Id },
      });
      console.log('is member :', isMember);
      if (isSubbed.subscribed && isMember) {
        return this.sendMainMenu(chatId);
      }
      return await this.bot.sendMessage(
        chatId,
        ' 🚨 You need to subscribe to our channel and turn on your notification:',
        {
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        },
      );
    } catch (error) {
      console.log(error);
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
          const suscribed = await this.updateUser(msg.chat.username, {
            subscribed: true,
          });
          if (suscribed) {
            return await this.sendMessageToUser(
              chatId,
              'you have successfully subscribed to our services',
            );

            break;
          }

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
        case '/view_wishlist':
          const list = await this.sendwishListAirdrops(chatId);
          if (list) break;
          break;

        // Add more cases for other airdrop categories as needed
        default:
          // Handle unknown commands or provide instructions
          const keyboard = [
            [{ text: 'Hottest 🔥 Airdrops', callback_data: '/hottest' }],
            [
              {
                text: 'Potential 💡 Airdrops',
                callback_data: '/potential',
              },
            ],
            [{ text: 'Latest  📅  Airdrops', callback_data: '/latest' }],
            [{ text: 'view wishList 🛒', callback_data: '/view_wishlist' }],
          ];

          // Set up the keyboard markup
          const replyMarkup = {
            inline_keyboard: keyboard,
          };
          return this.bot.sendMessage(
            chatId,
            '❌ Use the commands below to scan through Airdrops:',
            {
              reply_markup: replyMarkup,
            },
          );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Method to handle airdrop commands
  handleButtonCommands = async (query: any) => {
    let command: string;
    let airdropId: number;
    // function to check if query.data is a json type
    function isJSON(str) {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    }

    if (isJSON(query.data)) {
      command = JSON.parse(query.data).action;
      airdropId = JSON.parse(query.data).id;
    } else {
      command = query.data;
    }
    // console.log(query.message.chat.id);
    const chatId = query.message.chat.id;

    const userId = query.from.id;
    console.log(command);
    console.log(airdropId);
    console.log(userId, chatId);
    try {
      switch (command) {
        case '/getstarted':
          const started = await this.sendMenu(chatId);
          if (started) break;
          break;
        case '/done':
          const done = await this.checkDone(chatId, userId);
          if (done) break;
          break;
        case '/hottest':
          const hottest = await this.sendHottestAirdrops(chatId);
          if (hottest) break;
          break;
        case '/potential':
          const potential = await this.sendPotentialAirdrops(chatId);
          if (potential) break;
        case '/latest':
          const latest = await this.sendLatestAirdrops(chatId);
          if (latest) break;
          break;
        case '/subscribe':
          const suscribed = await this.updateUser(query.message.chat.username, {
            subscribed: true,
          });
          if (suscribed) {
            return await this.sendMessageToUser(
              chatId,
              'you have successfully subscribed to getting notified of our services',
            );
          }

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

        case '/add_to_wishlist':
          // get the userId first
          const userDbId = await this.databaseService.user.findFirst({
            where: { chat_id: chatId },
          });
          if (userDbId) {
            try {
              console.log(userDbId);
              const addToWishlist = await this.saveToWishlist(
                userDbId.id,
                airdropId,
              );
              if (addToWishlist && addToWishlist !== 'exist') {
                return this.bot.sendMessage(
                  chatId,
                  '✅ Successfully added to Wishlist',
                );
              } else if (addToWishlist === 'exist') {
                return this.bot.sendMessage(
                  chatId,
                  '👍 Airdrop already in your wishlist',
                );
              } else {
                return this.bot.sendMessage(
                  chatId,
                  '❌ Sorry there was an error while adding to wishlist',
                );
              }
            } catch (error) {}
            break;
          }

          break;

        case '/view_wishlist':
          const list = await this.sendwishListAirdrops(chatId);
          if (list) break;
          break;

        case '/removefrom_wishlist':
          const userDbId3 = await this.databaseService.user.findFirst({
            where: { chat_id: chatId },
          });
          if (userDbId3) {
            try {
              const airdrop = await this.removeFromWishlist(
                airdropId,
                userDbId3.id,
              );
              console.log('airdrop to del :', airdrop);
              if (airdrop) {
                return this.bot.sendMessage(
                  chatId,
                  '✅ Successfully removed from Wishlist',
                );
              } else if (airdrop == null) {
                return this.bot.sendMessage(
                  chatId,
                  '❓ Sorry the airdrop is not in your wishlist',
                );
              } else {
                return this.bot.sendMessage(
                  chatId,
                  '❌ Sorry there was an error try again',
                );
              }
            } catch (error) {
              console.log(error);
            }
            break;
          }

          break;

        // Add more cases for other airdrop categories as needed
        default:
          // Handle unknown commands or provide instructions
          const keyboard = [
            [{ text: 'Hottest 🔥 Airdrops', callback_data: '/hottest' }],
            [
              {
                text: 'Potential 💡 Airdrops',
                callback_data: '/potential',
              },
            ],
            [{ text: 'Latest  📅  Airdrops', callback_data: '/latest' }],
            [{ text: 'view wishList 🛒', callback_data: '/view_wishlist' }],
          ];

          // Set up the keyboard markup
          const replyMarkup = {
            inline_keyboard: keyboard,
          };
          return this.bot.sendMessage(
            chatId,
            '❌ Use the commands below to scan through Airdrops:',
            {
              reply_markup: replyMarkup,
            },
          );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Method to send detailed information about a specific airdrop
  sendAirdropDetails = async (
    chatId: string,
    airdropId: number,
    imageUrl: string,
    airdropName: string,
    network?: string,
    details?: string,
    category?: string,
    steps?: string,
    cost?: string,
  ) => {
    const keyboard = [
      [
        {
          text: 'Add to wishList 🛒',
          callback_data: JSON.stringify({
            action: '/add_to_wishlist',
            id: airdropId,
          }),
        },
      ],
    ];

    // Set up the keyboard markup
    const replyMarkup = {
      inline_keyboard: keyboard,
    };
    try {
      const detailsMessage = `${airdropName}\n\n
    ${network}.\n${details}.\n\n\t${steps}\n\n\tCost: ${cost}`;
      // send without picture is imageurl is empty
      if (imageUrl) {
        return await this.sendPictureToUser(
          chatId,
          imageUrl,
          detailsMessage,
          replyMarkup,
        );
      } else {
        return await this.bot.sendMessage(chatId, detailsMessage, {
          reply_markup: replyMarkup,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // sendWishlist airdrops
  sendWishListAirdropDetails = async (
    chatId: string,
    airdropId: number,
    imageUrl: string,
    airdropName: string,
    network?: string,
    details?: string,
    category?: string,
    steps?: string,
    cost?: string,
  ) => {
    const keyboard = [
      [
        {
          text: 'Remove from wishlist 🛒❌',
          callback_data: JSON.stringify({
            action: '/removefrom_wishlist',
            id: airdropId,
          }),
        },
      ],
    ];

    // Set up the keyboard markup
    const replyMarkup = {
      inline_keyboard: keyboard,
    };
    try {
      const detailsMessage = `${airdropName}\n\n
    ${network}.\n${details}.\n\n\t${steps}\n\n\tCost: ${cost}`;
      // send without picture is imageurl is empty
      if (imageUrl) {
        return await this.sendPictureToUser(
          chatId,
          imageUrl,
          detailsMessage,
          replyMarkup,
        );
      } else {
        return await this.bot.sendMessage(chatId, detailsMessage, {
          reply_markup: replyMarkup,
        });
      }
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
            airdrop.id,
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
            airdrop.id,
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
            airdrop.id,
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

  // Method to wishlists airdrops
  sendwishListAirdrops = async (chatId: number) => {
    try {
      const message = await this.sendMessageToUser(
        chatId.toString(),
        '🛒 Your wishlists 👇',
      );
      if (message) {
        // use chatId to get all users wishlist
        const wishLists = await this.databaseService.user.findFirst({
          where: { chat_id: chatId },
          include: { Wishlist: { include: { airdrop: true } } },
        });
        if (wishLists) {
          const wishListArray = wishLists.Wishlist;
          console.log('db2: ', wishListArray);
          if (wishListArray.length == 0) {
            return this.bot.sendMessage(chatId, '❓ Your wishlist is empty');
          }
          const WishList = wishListArray.map(async (airdrops) => {
            const options = {
              wordwrap: 130,
              // ...
            };
            const ConvertedText = convert(
              airdrops.airdrop.description,
              options,
            );
            return await this.sendWishListAirdropDetails(
              chatId.toString(),
              airdrops.airdrop.id,
              airdrops.airdrop.imageUrl,
              airdrops.airdrop.name,
              airdrops.airdrop.network,
              ConvertedText,
              airdrops.airdrop.category,
              airdrops.airdrop.steps,
              airdrops.airdrop.cost,
            );
          });
          return WishList;
        }
        return;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  // method for users to add aidrop to wishlist
  // addToWishlist = async (airdropId: number) => {
  //   try {
  //     this.databaseService.user.findFirst({
  //       where: { id: airdropId },
  //     });
  //   } catch (error) {}
  // };

  // method for users to remove aidrop to wishlist
  removeFromWishlist = async (airdrop_Id: number, owner_Id: number) => {
    try {
      const exist = await this.databaseService.wishlists.findFirst({
        where: { airdropId: airdrop_Id, ownerId: owner_Id },
      });
      console.log('exist :', exist);
      if (exist) {
        return this.databaseService.wishlists.deleteMany({
          where: { airdropId: airdrop_Id, ownerId: owner_Id },
        });
      } else {
        return exist;
      }
    } catch (error) {}
  };
}
