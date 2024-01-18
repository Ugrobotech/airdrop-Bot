"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const TelegramBot = require("node-telegram-bot-api");
const database_service_1 = require("../database/database.service");
const html_to_text_1 = require("html-to-text");
const TELEGRAM_TOKEN = '6772341762:AAFD7W55yv9i2OMUqnPb8hKOa6X-zXsuvqY';
let BotService = BotService_1 = class BotService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(BotService_1.name);
        this.onReceiveMessage = async (msg) => {
            this.logger.debug(msg);
            try {
                if (!msg.text) {
                    this.sendMessageToUser(msg.chat.id, 'Unknown command. Please use\n\n' +
                        '\t /hottest - View hottest 🔥 airdrops\n' +
                        '\t /potential - View potential 💡 airdrops\n' +
                        '\t /latest - View latest 📅 airdrops\n\n' +
                        '\t /subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
                        `\t /unsubscribe - ❌ To stop getting notification from me`);
                }
                const command = msg.text.toLowerCase();
                if (command === '/start') {
                    await this.sendMainMenu(msg.chat.id);
                    await this.saveToDB({
                        username: msg.chat.username,
                        first_name: msg.chat.first_name,
                        chat_id: msg.chat.id,
                    });
                }
                else {
                    this.handleAirdropCommands(msg);
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendPictureToUser = async (userId, imageUrl) => {
            try {
                return await this.bot.sendPhoto(userId, imageUrl, {
                    parse_mode: 'HTML',
                    caption: 'Unknown command. Please use\n\n' +
                        '\t /hottest - View hottest 🔥 airdrops\n' +
                        '\t /potential - View potential 💡 airdrops\n' +
                        '\t /latest - View latest 📅 airdrops\n\n' +
                        '\t /subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
                        `\t /unsubscribe - ❌ To stop getting notification from me`,
                });
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendMessageToUser = async (userId, message) => {
            try {
                return await this.bot.sendMessage(userId, message, {
                    parse_mode: 'HTML',
                });
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendToAllUsers = async (userIds, message) => {
            try {
                const sendALL = userIds.map(async (user) => {
                    return await this.bot.sendMessage(user, message);
                });
                return sendALL;
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendMainMenu = async (chatId) => {
            try {
                const message = 'Welcome👋! to AirdropBot @SkyDrip_bot. Choose an action:\n' +
                    '/hottest - View hottest 🔥 airdrops\n' +
                    '/potential - View potential 💡 airdrops\n' +
                    '/latest - View latest 📅 airdrops\n\n' +
                    '/subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
                    `/unsubscribe - ❌ To stop getting notification from me`;
                return await this.sendMessageToUser(chatId, message);
            }
            catch (error) {
                console.error(error);
            }
        };
        this.handleAirdropCommands = async (msg) => {
            const chatId = msg.chat.id;
            const command = msg.text.toLowerCase();
            try {
                switch (command) {
                    case '/hottest':
                        const hottest = await this.sendHottestAirdrops(chatId);
                        if (hottest)
                            break;
                    case '/potential':
                        const potential = await this.sendPotentialAirdrops(chatId);
                        if (potential)
                            break;
                    case '/latest':
                        const latest = await this.sendLatestAirdrops(chatId);
                        if (latest)
                            break;
                    case '/subscribe':
                        return await this.sendPictureToUser(chatId, 'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&cs=tinysrgb&w=600');
                        break;
                    case '/unsubscribe':
                        const unsubscribed = await this.updateUser(msg.chat.username, {
                            subscribed: false,
                        });
                        if (unsubscribed) {
                            return await this.sendMessageToUser(chatId, 'You have successfuly unsunscribed from our services');
                            break;
                        }
                        break;
                    default:
                        return await this.sendMessageToUser(chatId, 'Unknown command. Please use\n\n' +
                            '\t /hottest - View hottest 🔥 airdrops\n' +
                            '\t /potential - View potential 💡 airdrops\n' +
                            '\t /latest - View latest 📅 airdrops\n\n' +
                            '\t /subscribe - Subscribe 🔄 to get notified of the lastest airdrops\n' +
                            `\t /unsubscribe - ❌ To stop getting notification from me`);
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendAirdropDetails = async (chatId, airdropName, network, details, category, steps, cost) => {
            try {
                const detailsMessage = `${airdropName}\n\n
    ${network}.\n${details}.\n\n\t${steps}\n\n\tCost: ${cost}`;
                return await this.sendMessageToUser(chatId, detailsMessage);
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendHottestAirdrops = async (chatId) => {
            try {
                const message = await this.sendMessageToUser(chatId, '🔥 Hottest Airdrops 👇');
                if (message) {
                    const hottestAirDrops = await this.fetchAirdrops('HOTTEST');
                    const hotDrops = hottestAirDrops.map(async (airdrop) => {
                        const options = {
                            wordwrap: 130,
                        };
                        const ConvertedText = (0, html_to_text_1.convert)(airdrop.description, options);
                        return await this.sendAirdropDetails(chatId, airdrop.name, airdrop.network, ConvertedText, airdrop.category, airdrop.steps, airdrop.cost);
                    });
                    return hotDrops;
                }
                return;
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendPotentialAirdrops = async (chatId) => {
            try {
                const message = await this.sendMessageToUser(chatId, '💡 Potential Airdrops 👇');
                if (message) {
                    const potentialAirDrops = await this.fetchAirdrops('POTENTIAL');
                    const potDrops = potentialAirDrops.map(async (airdrop) => {
                        const options = {
                            wordwrap: 130,
                        };
                        const ConvertedText = (0, html_to_text_1.convert)(airdrop.description, options);
                        return await this.sendAirdropDetails(chatId, airdrop.name, airdrop.network, ConvertedText, airdrop.category, airdrop.steps, airdrop.cost);
                    });
                    return potDrops;
                }
                return;
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendLatestAirdrops = async (chatId) => {
            try {
                const message = await this.sendMessageToUser(chatId, '📅 Latest Airdrops 👇');
                if (message) {
                    const latestAirDrops = await this.fetchAirdrops('LATEST');
                    const latestDrops = latestAirDrops.map(async (airdrop) => {
                        const options = {
                            wordwrap: 130,
                        };
                        const ConvertedText = (0, html_to_text_1.convert)(airdrop.description, options);
                        return await this.sendAirdropDetails(chatId, airdrop.name, airdrop.network, ConvertedText, airdrop.category, airdrop.steps, airdrop.cost);
                    });
                    return latestDrops;
                }
                return;
            }
            catch (error) {
                console.error(error);
            }
        };
        this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
        this.bot.on('message', this.onReceiveMessage);
    }
    async saveToDB(saveUserDto) {
        try {
            const isSaved = await this.databaseService.user.findFirst({
                where: { username: saveUserDto.username },
            });
            if (!isSaved) {
                return this.databaseService.user.create({ data: saveUserDto });
            }
            return;
        }
        catch (error) {
            console.error(error);
        }
    }
    async updateUser(username, updateUserDto) {
        return await this.databaseService.user.update({
            where: { username },
            data: updateUserDto,
        });
    }
    async fetchAirdrops(category) {
        try {
            return await this.databaseService.airDrops.findMany({
                where: { category },
            });
        }
        catch (error) {
            console.error(error);
        }
    }
};
exports.BotService = BotService;
exports.BotService = BotService = BotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], BotService);
//# sourceMappingURL=bot.service.js.map