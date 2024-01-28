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
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
let BotService = BotService_1 = class BotService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(BotService_1.name);
        this.onReceiveMessage = async (msg) => {
            this.logger.debug(msg);
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
            const replyMarkup = {
                inline_keyboard: keyboard,
            };
            try {
                if (!msg.text) {
                    this.bot.sendMessage(msg.chat.id, 'Invalid command, please Choose an option:', {
                        reply_markup: replyMarkup,
                    });
                }
                const command = msg.text.toLowerCase();
                console.log('command :', command);
                if (command === '/start') {
                    const chat_Id = +msg.chat.id;
                    await this.sendWelcomeMenu(msg.chat.id);
                    await this.saveToDB({
                        username: msg.chat.username,
                        first_name: msg.chat.first_name,
                        chat_id: chat_Id,
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
        this.sendPictureToUser = async (userId, imageUrl, message, markup) => {
            try {
                return await this.bot.sendPhoto(userId, imageUrl, {
                    parse_mode: 'HTML',
                    caption: message,
                    reply_markup: markup,
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
        this.notifyAllUsers = async (messageId) => {
            try {
                const users = await this.databaseService.user.findMany();
                const message = await this.databaseService.airDrops.findFirst({
                    where: { id: messageId },
                });
                if (users && message) {
                    const sendALL = users.map(async (user) => {
                        const options = {
                            wordwrap: 130,
                        };
                        const ConvertedText = (0, html_to_text_1.convert)(message.description, options);
                        return await this.sendAirdropDetails(user.chat_id.toString(), message.id, message.imageUrl, message.name, message.network, ConvertedText, message.category, message.steps, message.cost);
                    });
                    return sendALL;
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        this.notifyWishlist = async (airdrop_Id) => {
            try {
                const users = await this.databaseService.wishlist.findMany({
                    where: { airdropId: airdrop_Id },
                    include: { owner: true },
                });
                const message = await this.databaseService.airDrops.findFirst({
                    where: { id: airdrop_Id },
                });
                if (users && message) {
                    const sendALL = users.map(async (user) => {
                        const options = {
                            wordwrap: 130,
                        };
                        const ConvertedText = (0, html_to_text_1.convert)(message.description, options);
                        return await this.sendAirdropDetails(user.owner.chat_id.toString(), message.id, message.imageUrl, message.name, message.network, ConvertedText, message.category, message.steps, message.cost);
                    });
                    return sendALL;
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendMainMenu = async (chatId) => {
            const keyboard = [
                [{ text: 'Hottest 🔥 Airdrops', callback_data: '/hottest' }],
                [{ text: 'Potential 💡 Airdrops', callback_data: '/potential' }],
                [{ text: 'Latest  📅  Airdrops', callback_data: '/latest' }],
                [{ text: 'view wishList 🛒', callback_data: '/view_wishlist' }],
            ];
            const replyMarkup = {
                inline_keyboard: keyboard,
            };
            try {
                return this.bot.sendMessage(chatId, '👍 Use the commands below to scan through Airdrops:', {
                    reply_markup: replyMarkup,
                });
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendWelcomeMenu = async (chatId) => {
            const keyboard = [
                [
                    {
                        text: 'Get started with me 🚀',
                        callback_data: '/getstarted',
                    },
                ],
            ];
            const replyMarkup = {
                inline_keyboard: keyboard,
            };
            try {
                return await this.sendPictureToUser(chatId, 'https://ibb.co/L1Ps4jx', 'Welcome👋! to AirdropScanBot @Airdrop_ScanBot, your go-to airdrop scanner! 🚀', replyMarkup);
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendMenu = async (chatId) => {
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
            const replyMarkup = {
                inline_keyboard: keyboard,
            };
            try {
                return await this.bot.sendMessage(chatId, ' 📝 To utilize the airdrop scanning feature, kindly subscribe to our Telegram channel and enable notification services.:', { reply_markup: replyMarkup });
            }
            catch (error) {
                console.error(error);
            }
        };
        this.checkDone = async (chatId, userId) => {
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
            const replyMarkup = {
                inline_keyboard: keyboard,
            };
            console.log('I am here');
            try {
                const groupId = -1002116374739;
                const user_Id = userId;
                console.log('user id :', user_Id);
                const chat_Id = +chatId;
                console.log('chat id :', chat_Id);
                let isMember;
                this.bot
                    .getChatMember(groupId, userId)
                    .then((member) => {
                    if (member.status === 'member' ||
                        member.status === 'administrator' ||
                        member.status === 'creator') {
                        isMember = true;
                        console.log('status :', member.status);
                    }
                    else {
                        isMember = false;
                    }
                })
                    .catch((e) => {
                    if (e.response.body.error_code == 400) {
                        console.log('does not exist :', e.response.body);
                        isMember = false;
                    }
                });
                const isSubbed = await this.databaseService.user.findFirst({
                    where: { chat_id: chat_Id },
                });
                console.log('is member :', isMember);
                if (isSubbed.subscribed && isMember) {
                    return this.sendMainMenu(chatId);
                }
                return await this.bot.sendMessage(chatId, ' 🚨 You need to subscribe to our channel and turn on your notification:', {
                    parse_mode: 'HTML',
                    reply_markup: replyMarkup,
                });
            }
            catch (error) {
                console.log(error);
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
                        const suscribed = await this.updateUser(msg.chat.username, {
                            subscribed: true,
                        });
                        if (suscribed) {
                            return await this.sendMessageToUser(chatId, 'you have successfully subscribed to our services');
                            break;
                        }
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
                    case '/view_wishlist':
                        const list = await this.sendwishListAirdrops(chatId);
                        if (list)
                            break;
                        break;
                    default:
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
                        const replyMarkup = {
                            inline_keyboard: keyboard,
                        };
                        return this.bot.sendMessage(chatId, '❌ Use the commands below to scan through Airdrops:', {
                            reply_markup: replyMarkup,
                        });
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        this.handleButtonCommands = async (query) => {
            let command;
            let airdropId;
            function isJSON(str) {
                try {
                    JSON.parse(str);
                    return true;
                }
                catch (e) {
                    return false;
                }
            }
            if (isJSON(query.data)) {
                command = JSON.parse(query.data).action;
                airdropId = JSON.parse(query.data).id;
            }
            else {
                command = query.data;
            }
            const chatId = query.message.chat.id;
            const userId = query.from.id;
            console.log(command);
            console.log(airdropId);
            console.log(userId, chatId);
            try {
                switch (command) {
                    case '/getstarted':
                        const started = await this.sendMenu(chatId);
                        if (started)
                            break;
                        break;
                    case '/done':
                        const done = await this.checkDone(chatId, userId);
                        if (done)
                            break;
                        break;
                    case '/hottest':
                        const hottest = await this.sendHottestAirdrops(chatId);
                        if (hottest)
                            break;
                        break;
                    case '/potential':
                        const potential = await this.sendPotentialAirdrops(chatId);
                        if (potential)
                            break;
                    case '/latest':
                        const latest = await this.sendLatestAirdrops(chatId);
                        if (latest)
                            break;
                        break;
                    case '/subscribe':
                        const suscribed = await this.updateUser(query.message.chat.username, {
                            subscribed: true,
                        });
                        if (suscribed) {
                            return await this.sendMessageToUser(chatId, 'you have successfully subscribed to getting notified of our services');
                        }
                        break;
                    case '/unsubscribe':
                        const unsubscribed = await this.updateUser(query.msg.chat.username, {
                            subscribed: false,
                        });
                        if (unsubscribed) {
                            return await this.sendMessageToUser(chatId, 'You have successfuly unsunscribed from our services');
                            break;
                        }
                        break;
                    case '/add_to_wishlist':
                        const userDbId = await this.databaseService.user.findFirst({
                            where: { chat_id: chatId },
                        });
                        if (userDbId) {
                            try {
                                console.log(userDbId);
                                const addToWishlist = await this.saveToWishlist(userDbId.id, airdropId);
                                if (addToWishlist && addToWishlist !== 'exist') {
                                    return this.bot.sendMessage(chatId, '✅ Successfully added to Wishlist');
                                }
                                else if (addToWishlist === 'exist') {
                                    return this.bot.sendMessage(chatId, '👍 Airdrop already in your wishlist');
                                }
                                else {
                                    return this.bot.sendMessage(chatId, '❌ Sorry there was an error while adding to wishlist');
                                }
                            }
                            catch (error) { }
                            break;
                        }
                        break;
                    case '/view_wishlist':
                        const list = await this.sendwishListAirdrops(chatId);
                        if (list)
                            break;
                        break;
                    case '/removefrom_wishlist':
                        const userDbId3 = await this.databaseService.user.findFirst({
                            where: { chat_id: chatId },
                        });
                        if (userDbId3) {
                            try {
                                const airdrop = await this.removeFromWishlist(airdropId, userDbId3.id);
                                console.log('airdrop to del :', airdrop);
                                if (airdrop) {
                                    return this.bot.sendMessage(chatId, '✅ Successfully removed from Wishlist');
                                }
                                else if (airdrop == null) {
                                    return this.bot.sendMessage(chatId, '❓ Sorry the airdrop is not in your wishlist');
                                }
                                else {
                                    return this.bot.sendMessage(chatId, '❌ Sorry there was an error try again');
                                }
                            }
                            catch (error) {
                                console.log(error);
                            }
                            break;
                        }
                        break;
                    default:
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
                            [{ text: 'view wishList 🛒', callback_data: '/view_wishlist' }],
                        ];
                        const replyMarkup = {
                            inline_keyboard: keyboard,
                        };
                        return this.bot.sendMessage(chatId, '❌ Use the commands below to scan through Airdrops:', {
                            reply_markup: replyMarkup,
                        });
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendAirdropDetails = async (chatId, airdropId, imageUrl, airdropName, network, details, category, steps, cost) => {
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
            const replyMarkup = {
                inline_keyboard: keyboard,
            };
            try {
                const detailsMessage = `${airdropName}\n\n
    ${network}.\n${details}.\n\n\t${steps}\n\n\tCost: ${cost}`;
                if (imageUrl) {
                    return await this.sendPictureToUser(chatId, imageUrl, detailsMessage, replyMarkup);
                }
                else {
                    return await this.bot.sendMessage(chatId, detailsMessage, {
                        reply_markup: replyMarkup,
                    });
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendWishListAirdropDetails = async (chatId, airdropId, imageUrl, airdropName, network, details, category, steps, cost) => {
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
            const replyMarkup = {
                inline_keyboard: keyboard,
            };
            try {
                const detailsMessage = `${airdropName}\n\n
    ${network}.\n${details}.\n\n\t${steps}\n\n\tCost: ${cost}`;
                if (imageUrl) {
                    return await this.sendPictureToUser(chatId, imageUrl, detailsMessage, replyMarkup);
                }
                else {
                    return await this.bot.sendMessage(chatId, detailsMessage, {
                        reply_markup: replyMarkup,
                    });
                }
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
                        return await this.sendAirdropDetails(chatId, airdrop.id, airdrop.imageUrl, airdrop.name, airdrop.network, ConvertedText, airdrop.category, airdrop.steps, airdrop.cost);
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
                        return await this.sendAirdropDetails(chatId, airdrop.id, airdrop.imageUrl, airdrop.name, airdrop.network, ConvertedText, airdrop.category, airdrop.steps, airdrop.cost);
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
                        return await this.sendAirdropDetails(chatId, airdrop.id, airdrop.imageUrl, airdrop.name, airdrop.network, ConvertedText, airdrop.category, airdrop.steps, airdrop.cost);
                    });
                    return latestDrops;
                }
                return;
            }
            catch (error) {
                console.error(error);
            }
        };
        this.sendwishListAirdrops = async (chatId) => {
            try {
                const message = await this.sendMessageToUser(chatId.toString(), '🛒 Your wishlists 👇');
                if (message) {
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
                            };
                            const ConvertedText = (0, html_to_text_1.convert)(airdrops.airdrop.description, options);
                            return await this.sendWishListAirdropDetails(chatId.toString(), airdrops.airdrop.id, airdrops.airdrop.imageUrl, airdrops.airdrop.name, airdrops.airdrop.network, ConvertedText, airdrops.airdrop.category, airdrops.airdrop.steps, airdrops.airdrop.cost);
                        });
                        return WishList;
                    }
                    return;
                }
                return;
            }
            catch (error) {
                console.error(error);
            }
        };
        this.removeFromWishlist = async (airdrop_Id, owner_Id) => {
            try {
                const exist = await this.databaseService.wishlist.findFirst({
                    where: { airdropId: airdrop_Id, ownerId: owner_Id },
                });
                console.log('exist :', exist);
                if (exist) {
                    return this.databaseService.wishlist.deleteMany({
                        where: { airdropId: airdrop_Id, ownerId: owner_Id },
                    });
                }
                else {
                    return exist;
                }
            }
            catch (error) { }
        };
        this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
        this.bot.on('message', this.onReceiveMessage);
        this.bot.on('callback_query', this.handleButtonCommands);
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
    async saveToWishlist(owner_Id, airdrop_Id) {
        try {
            const isAdded = await this.databaseService.wishlist.findFirst({
                where: { airdropId: airdrop_Id, ownerId: owner_Id },
            });
            if (!isAdded) {
                return await this.databaseService.wishlist.create({
                    data: {
                        owner: { connect: { id: owner_Id } },
                        airdrop: { connect: { id: airdrop_Id } },
                    },
                });
            }
            return 'exist';
        }
        catch (error) {
            console.error(error);
        }
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