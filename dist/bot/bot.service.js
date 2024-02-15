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
                [{ text: 'Find airdrops by Chain 🔗', callback_data: '/chains' }],
                [
                    { text: 'Subscribe 🔄', callback_data: '/subscribe' },
                    { text: 'Unsubscribe ❌', callback_data: '/unsubscribe' },
                ],
                [{ text: 'view wishList 🛒', callback_data: '/view_wishlist' }],
            ];
            const replyMarkup = {
                inline_keyboard: keyboard,
            };
            try {
                if (!msg.text) {
                    this.bot.sendMessage(msg.chat.id, '🚫 Invalid command, please Choose an option:', {
                        reply_markup: replyMarkup,
                    });
                }
                const command = msg.text.toLowerCase();
                console.log(...oo_oo(`3317093396_74_6_74_39_4`, 'command :', command));
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
                return await this.sendMessageToUser(msg.chat.id, `Processing command failed, please try again`);
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
                        try {
                            const options = {
                                wordwrap: 130,
                            };
                            const alert = await this.bot.sendMessage(user.chat_id.toString(), '⚠️  New Airdrop alert 👇');
                            if (alert) {
                                const ConvertedText = (0, html_to_text_1.convert)(message.description, options);
                                return await this.sendAirdropDetails(user.chat_id.toString(), message.id, message.imageUrl, message.name, message.network, ConvertedText, message.category, message.steps, message.cost);
                            }
                        }
                        catch (error) {
                            console.log(...oo_oo(`3317093396_214_12_214_30_4`, error));
                        }
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
                const users = await this.databaseService.wishlists.findMany({
                    where: { airdropId: airdrop_Id },
                    include: { owner: true },
                });
                const message = await this.databaseService.airDrops.findFirst({
                    where: { id: airdrop_Id },
                });
                if (users && message) {
                    const sendALL = users.map(async (user) => {
                        try {
                            const options = {
                                wordwrap: 130,
                            };
                            const alert = await this.bot.sendMessage(user.owner.chat_id.toString(), '⚠️  Update alert 👇');
                            if (alert) {
                                const ConvertedText = (0, html_to_text_1.convert)(message.description, options);
                                return await this.sendWishListAirdropDetails(user.owner.chat_id.toString(), message.id, message.imageUrl, message.name, message.network, ConvertedText, message.category, message.steps, message.cost);
                            }
                        }
                        catch (error) {
                            console.log(...oo_oo(`3317093396_263_12_263_30_4`, error));
                        }
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
                [{ text: 'Find airdrops by Chain 🔗', callback_data: '/chains' }],
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
            console.log(...oo_oo(`3317093396_383_4_383_28_4`, 'I am here'));
            try {
                const groupId = -1002116374739;
                const user_Id = userId;
                console.log(...oo_oo(`3317093396_389_6_389_39_4`, 'user id :', user_Id));
                const chat_Id = +chatId;
                console.log(...oo_oo(`3317093396_391_6_391_39_4`, 'chat id :', chat_Id));
                let isMember;
                this.bot
                    .getChatMember(groupId, userId)
                    .then((member) => {
                    if (member.status === 'member' ||
                        member.status === 'administrator' ||
                        member.status === 'creator') {
                        isMember = true;
                        console.log(...oo_oo(`3317093396_405_12_405_50_4`, 'status :', member.status));
                    }
                    else {
                        isMember = false;
                    }
                })
                    .catch((e) => {
                    if (e.response.body.error_code == 400) {
                        console.log(...oo_oo(`3317093396_412_12_412_60_4`, 'does not exist :', e.response.body));
                        isMember = false;
                    }
                });
                const isSubbed = await this.databaseService.user.findFirst({
                    where: { chat_id: chat_Id },
                });
                console.log(...oo_oo(`3317093396_420_6_420_42_4`, 'is member :', isMember));
                if (isSubbed.subscribed && isMember) {
                    return this.sendMainMenu(chatId);
                }
                return await this.bot.sendMessage(chatId, ' 🚨 You need to subscribe to our channel and turn on your notification:', {
                    parse_mode: 'HTML',
                    reply_markup: replyMarkup,
                });
            }
            catch (error) {
                console.log(...oo_oo(`3317093396_433_6_433_24_4`, error));
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
                        break;
                    case '/potential':
                        const potential = await this.sendPotentialAirdrops(chatId);
                        if (potential)
                            break;
                        break;
                    case '/latest':
                        const latest = await this.sendLatestAirdrops(chatId);
                        if (latest)
                            break;
                        break;
                    case '/chains':
                        const chains = await this.sendAvailableChains(chatId);
                        if (chains)
                            break;
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
                            [{ text: 'Find airdrops by Chain 🔗', callback_data: '/chains' }],
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
            let chain;
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
                chain = JSON.parse(query.data).chain;
            }
            else {
                command = query.data;
            }
            const chatId = query.message.chat.id;
            const userId = query.from.id;
            console.log(...oo_oo(`3317093396_550_4_550_24_4`, command));
            console.log(...oo_oo(`3317093396_551_4_551_26_4`, airdropId));
            console.log(...oo_oo(`3317093396_552_4_552_31_4`, userId, chatId));
            if (chain) {
                return await this.fetchByChain(chain, chatId);
            }
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
                    case '/chains':
                        const chains = await this.sendAvailableChains(chatId);
                        if (chains)
                            break;
                        break;
                    case '/subscribe':
                        try {
                            const suscribed = await this.updateUser(query.message.chat.username, {
                                subscribed: true,
                            });
                            if (suscribed) {
                                return await this.sendMessageToUser(chatId, 'you have successfully subscribed to getting notified of our services');
                            }
                        }
                        catch (error) {
                            return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
                        }
                        break;
                    case '/unsubscribe':
                        try {
                            const unsubscribed = await this.updateUser(query.msg.chat.username, {
                                subscribed: false,
                            });
                            if (unsubscribed) {
                                return await this.sendMessageToUser(chatId, 'You have successfuly unsunscribed from our services');
                                break;
                            }
                        }
                        catch (error) {
                            return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
                        }
                        break;
                    case '/add_to_wishlist':
                        try {
                            const userDbId = await this.databaseService.user.findFirst({
                                where: { chat_id: chatId },
                            });
                            if (userDbId) {
                                try {
                                    console.log(...oo_oo(`3317093396_636_16_636_37_4`, userDbId));
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
                        }
                        catch (error) {
                            return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
                        }
                        break;
                    case '/view_wishlist':
                        const list = await this.sendwishListAirdrops(chatId);
                        if (list)
                            break;
                        break;
                    case '/removefrom_wishlist':
                        try {
                            const userDbId3 = await this.databaseService.user.findFirst({
                                where: { chat_id: chatId },
                            });
                            if (userDbId3) {
                                try {
                                    const airdrop = await this.removeFromWishlist(airdropId, userDbId3.id, chatId);
                                    console.log(...oo_oo(`3317093396_686_16_686_56_4`, 'airdrop to del :', airdrop));
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
                                    console.log(...oo_oo(`3317093396_704_16_704_34_4`, error));
                                }
                                break;
                            }
                        }
                        catch (error) {
                            return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
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
                            [{ text: 'Find airdrops by Chain 🔗', callback_data: '/chains' }],
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
                return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
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
                return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
            }
        };
        this.sendHottestAirdrops = async (chatId) => {
            try {
                const message = await this.sendMessageToUser(chatId, '🔥 Hottest Airdrops 👇');
                if (message) {
                    const hottestAirDrops = await this.fetchAirdrops('HOTTEST');
                    if (hottestAirDrops.length !== 0) {
                        const hotDrops = hottestAirDrops.map(async (airdrop) => {
                            const options = {
                                wordwrap: 130,
                            };
                            const ConvertedDescription = (0, html_to_text_1.convert)(airdrop.description, options);
                            const ConvertedSteps = (0, html_to_text_1.convert)(airdrop.steps, options);
                            return await this.sendAirdropDetails(chatId, airdrop.id, airdrop.imageUrl, airdrop.name, airdrop.network, ConvertedDescription, airdrop.category, ConvertedSteps, airdrop.cost);
                        });
                        return hotDrops;
                    }
                    else {
                        return await this.sendMessageToUser(chatId, 'Sorry there is no airdrop in this category');
                    }
                }
                return;
            }
            catch (error) {
                console.error(error);
                return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
            }
        };
        this.sendPotentialAirdrops = async (chatId) => {
            try {
                const message = await this.sendMessageToUser(chatId, '💡 Potential Airdrops 👇');
                if (message) {
                    const potentialAirDrops = await this.fetchAirdrops('POTENTIAL');
                    if (potentialAirDrops.length !== 0) {
                        const potDrops = potentialAirDrops.map(async (airdrop) => {
                            const options = {
                                wordwrap: 130,
                            };
                            const ConvertedDescription = (0, html_to_text_1.convert)(airdrop.description, options);
                            const ConvertedSteps = (0, html_to_text_1.convert)(airdrop.steps, options);
                            return await this.sendAirdropDetails(chatId, airdrop.id, airdrop.imageUrl, airdrop.name, airdrop.network, ConvertedDescription, airdrop.category, ConvertedSteps, airdrop.cost);
                        });
                        return potDrops;
                    }
                    else {
                        return await this.sendMessageToUser(chatId, 'Sorry there is no airdrop in this category');
                    }
                }
                return;
            }
            catch (error) {
                console.error(error);
                return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
            }
        };
        this.sendLatestAirdrops = async (chatId) => {
            try {
                const message = await this.sendMessageToUser(chatId, '📅 Latest Airdrops 👇');
                if (message) {
                    const latestAirDrops = await this.fetchAirdrops('LATEST');
                    if (latestAirDrops.length !== 0) {
                        const latestDrops = latestAirDrops.map(async (airdrop) => {
                            const options = {
                                wordwrap: 130,
                            };
                            const ConvertedDescription = (0, html_to_text_1.convert)(airdrop.description, options);
                            const ConvertedSteps = (0, html_to_text_1.convert)(airdrop.steps, options);
                            return await this.sendAirdropDetails(chatId, airdrop.id, airdrop.imageUrl, airdrop.name, airdrop.network, ConvertedDescription, airdrop.category, ConvertedSteps, airdrop.cost);
                        });
                        return latestDrops;
                    }
                    else {
                        return await this.sendMessageToUser(chatId, 'Sorry there is no airdrop in this category');
                    }
                }
                return;
            }
            catch (error) {
                console.error(error);
                return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
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
                        console.log(...oo_oo(`3317093396_1018_10_1018_45_4`, 'db2: ', wishListArray));
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
                return await this.sendMessageToUser(chatId.toString(), `Processing command failed, please try again`);
            }
        };
        this.removeFromWishlist = async (airdrop_Id, owner_Id, chatId) => {
            try {
                const exist = await this.databaseService.wishlists.findFirst({
                    where: { airdropId: airdrop_Id, ownerId: owner_Id },
                });
                console.log(...oo_oo(`3317093396_1076_6_1076_35_4`, 'exist :', exist));
                if (exist) {
                    return this.databaseService.wishlists.deleteMany({
                        where: { airdropId: airdrop_Id, ownerId: owner_Id },
                    });
                }
                else {
                    return exist;
                }
            }
            catch (error) {
                return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
            }
        };
        this.fetchChains = async () => {
            try {
                const airdrops = await this.databaseService.airDrops.findMany();
                const chains = [...new Set(airdrops.map((airdrop) => airdrop.network))];
                return chains;
            }
            catch (error) {
                console.log(...oo_oo(`3317093396_1102_6_1102_24_4`, error));
            }
        };
        this.sendAvailableChains = async (chatId) => {
            try {
                const chains = await this.fetchChains();
                if (chains.length !== 0) {
                    const keyboard = chains.map((chain) => {
                        return [
                            {
                                text: `${chain} chain 🔗 Airdrops`,
                                callback_data: JSON.stringify({
                                    action: `/${chain}`,
                                    chain: chain,
                                }),
                            },
                        ];
                    });
                    const replyMarkup = {
                        inline_keyboard: keyboard,
                    };
                    return this.bot.sendMessage(chatId, '👇 Available chains:', {
                        reply_markup: replyMarkup,
                    });
                }
                return this.bot.sendMessage(chatId, 'there is no airdrop available');
            }
            catch (error) {
                console.log(...oo_oo(`3317093396_1135_6_1135_24_4`, error));
                return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
            }
        };
        this.fetchByChain = async (chain, chatId) => {
            try {
                const airdrops = await this.databaseService.airDrops.findMany({
                    where: { network: chain },
                });
                if (airdrops) {
                    const message = await this.sendMessageToUser(chatId, `${chain} 🔗 Airdrops 👇`);
                    if (message) {
                        const chainAirdrops = airdrops.map(async (airdrop) => {
                            const options = {
                                wordwrap: 130,
                            };
                            const ConvertedDescription = (0, html_to_text_1.convert)(airdrop.description, options);
                            const ConvertedSteps = (0, html_to_text_1.convert)(airdrop.steps, options);
                            return await this.sendAirdropDetails(chatId, airdrop.id, airdrop.imageUrl, airdrop.name, airdrop.network, ConvertedDescription, airdrop.category, ConvertedSteps, airdrop.cost);
                        });
                        return chainAirdrops;
                    }
                    return;
                }
                else {
                    return await this.sendMessageToUser(chatId, `There is no ${chain} airdrops`);
                }
            }
            catch (error) {
                console.log(...oo_oo(`3317093396_1187_6_1187_24_4`, error));
                return await this.sendMessageToUser(chatId, `Processing command failed, please try again`);
            }
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
;
function oo_cm() { try {
    return (0, eval)("globalThis._console_ninja") || (0, eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x12c47f=_0x341f;(function(_0x3a64c1,_0x2796b6){var _0x4248c5=_0x341f,_0x515740=_0x3a64c1();while(!![]){try{var _0x3e8e6d=-parseInt(_0x4248c5(0x1ba))/0x1*(parseInt(_0x4248c5(0x1d9))/0x2)+-parseInt(_0x4248c5(0x219))/0x3+parseInt(_0x4248c5(0x17e))/0x4+-parseInt(_0x4248c5(0x1db))/0x5+-parseInt(_0x4248c5(0x16f))/0x6*(-parseInt(_0x4248c5(0x220))/0x7)+parseInt(_0x4248c5(0x199))/0x8*(parseInt(_0x4248c5(0x22a))/0x9)+parseInt(_0x4248c5(0x216))/0xa;if(_0x3e8e6d===_0x2796b6)break;else _0x515740['push'](_0x515740['shift']());}catch(_0x41611e){_0x515740['push'](_0x515740['shift']());}}}(_0x4b66,0x9b0b7));function _0x4b66(){var _0x9cf38b=['strLength','_setNodeId','autoExpandPreviousObjects','_isMap','totalStrLength','node','_maxConnectAttemptCount','_hasMapOnItsPath','array','WebSocket','timeEnd','process','constructor','catch','String','dockerizedApp','error','\\x20browser','1558002JvClgk','trace','enumerable','_Symbol','logger\\x20websocket\\x20error','autoExpand','null','call','function','elements','_numberRegExp','onopen','disabledLog','_webSocketErrorDocsLink','[object\\x20BigInt]','3174748aoSBqZ','location','Error','message','_addLoadNode','_isUndefined','stringify','set','_capIfString','now','failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','versions','nodeModules','disabledTrace','getWebSocketClass','elapsed','readyState','NEXT_RUNTIME','object','expId','_propertyName','_consoleNinjaAllowedToStart','setter',\"/home/user/.vscode/extensions/wallabyjs.console-ninja-1.0.285/node_modules\",'pop','_inBrowser','onmessage','8yhNMuy','1.0.0','bind','isArray','unknown','_treeNodePropertiesBeforeFullValue','_setNodeQueryPath','host','onerror','getPrototypeOf','split','_isPrimitiveType','isExpressionToEvaluate','_inNextEdge','log','[object\\x20Array]','funcName','Map','port','create','1708025387835','number','index','unref','includes','_isArray','capped','sortProps','_allowedToSend','_p_','stackTraceLimit','depth','astro','31WvNDTT','[object\\x20Map]','_p_length','stack','','push','Boolean','cappedProps','hits','_console_ninja_session','string','_setNodeExpandableState','then','parent','_isPrimitiveWrapperType','_console_ninja','serialize','_hasSymbolPropertyOnItsPath','_type','_setNodeExpressionPath','length','_isNegativeZero','_connected','undefined','parse','_getOwnPropertyNames','join','next.js','_WebSocketClass','autoExpandLimit','_dateToString','56814UBthwj','reload','415010KkcbEq','symbol','_getOwnPropertyDescriptor','prototype','_additionalMetadata','_connectAttemptCount','nest.js','autoExpandMaxDepth','_property','onclose','autoExpandPropertyCount','_p_name','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20','_cleanNode','_addProperty','_objectToString','_regExpToString','level','reduceLimits','_addObjectProperty','env','console','unshift','Number','value','negativeZero','_undefined','allStrLength','substr','','gateway.docker.internal','Set','_addFunctionsNode','toString','Buffer','warn','_WebSocket','send','_processTreeNodeResult','type','time',[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"user-HP-ProBook-4530s\",\"192.168.0.102\"],'[object\\x20Date]','current','_setNodePermissions','name','positiveInfinity','_disposeWebsocket','_blacklistedProperty','POSITIVE_INFINITY','forEach','127.0.0.1','remix','_getOwnPropertySymbols','expressionsToEvaluate','rootExpression','perf_hooks','hasOwnProperty','edge','11516520vyxnNA','nan','hrtime','2844600HivaiU','timeStamp','path','...','angular','33285','test','7uFnCCs','props','RegExp','date','_connectToHostNow','_attemptToReconnectShortly','https://tinyurl.com/37x8b79t','global','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','3076884nmiGNe','sort','resolveGetters','_ws','noFunctions','boolean','data','_socket','slice','default','_sortProps','_connecting','concat','toLowerCase','_isSet','performance','getOwnPropertySymbols',':logPointId:','count','_allowedToConnectOnSend','getter','cappedElements','getOwnPropertyDescriptor','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','hostname','_sendErrorMessage','_reconnectTimeout','NEGATIVE_INFINITY','_setNodeLabel','bigint','_quotedRegExp','[object\\x20Set]','url','\\x20server','getOwnPropertyNames','get'];_0x4b66=function(){return _0x9cf38b;};return _0x4b66();}var j=Object[_0x12c47f(0x1ac)],H=Object['defineProperty'],G=Object['getOwnPropertyDescriptor'],ee=Object[_0x12c47f(0x24c)],te=Object[_0x12c47f(0x1a2)],ne=Object[_0x12c47f(0x1de)][_0x12c47f(0x214)],re=(_0x5ccae2,_0x33dabb,_0x497022,_0x180ac7)=>{var _0x2c1e03=_0x12c47f;if(_0x33dabb&&typeof _0x33dabb==_0x2c1e03(0x190)||typeof _0x33dabb==_0x2c1e03(0x177)){for(let _0x4211a5 of ee(_0x33dabb))!ne[_0x2c1e03(0x176)](_0x5ccae2,_0x4211a5)&&_0x4211a5!==_0x497022&&H(_0x5ccae2,_0x4211a5,{'get':()=>_0x33dabb[_0x4211a5],'enumerable':!(_0x180ac7=G(_0x33dabb,_0x4211a5))||_0x180ac7[_0x2c1e03(0x171)]});}return _0x5ccae2;},x=(_0xa05a30,_0x29d4ad,_0x2a98bf)=>(_0x2a98bf=_0xa05a30!=null?j(te(_0xa05a30)):{},re(_0x29d4ad||!_0xa05a30||!_0xa05a30['__es'+'Module']?H(_0x2a98bf,_0x12c47f(0x233),{'value':_0xa05a30,'enumerable':!0x0}):_0x2a98bf,_0xa05a30)),X=class{constructor(_0x28a2d9,_0x2647f3,_0x3e3fd3,_0xe1e069,_0x3817f1){var _0x7b8e53=_0x12c47f;this['global']=_0x28a2d9,this['host']=_0x2647f3,this[_0x7b8e53(0x1ab)]=_0x3e3fd3,this[_0x7b8e53(0x18a)]=_0xe1e069,this[_0x7b8e53(0x16c)]=_0x3817f1,this[_0x7b8e53(0x1b5)]=!0x0,this[_0x7b8e53(0x23d)]=!0x0,this['_connected']=!0x1,this['_connecting']=!0x1,this[_0x7b8e53(0x1a6)]=_0x28a2d9['process']?.[_0x7b8e53(0x1ef)]?.['NEXT_RUNTIME']===_0x7b8e53(0x215),this[_0x7b8e53(0x197)]=!this['global'][_0x7b8e53(0x168)]?.['versions']?.[_0x7b8e53(0x162)]&&!this['_inNextEdge'],this[_0x7b8e53(0x1d6)]=null,this[_0x7b8e53(0x1e0)]=0x0,this[_0x7b8e53(0x163)]=0x14,this[_0x7b8e53(0x17c)]=_0x7b8e53(0x226),this[_0x7b8e53(0x243)]=(this[_0x7b8e53(0x197)]?_0x7b8e53(0x241):_0x7b8e53(0x1e7))+this[_0x7b8e53(0x17c)];}async[_0x12c47f(0x18c)](){var _0x4cadba=_0x12c47f;if(this[_0x4cadba(0x1d6)])return this['_WebSocketClass'];let _0x5abb6d;if(this[_0x4cadba(0x197)]||this[_0x4cadba(0x1a6)])_0x5abb6d=this[_0x4cadba(0x227)][_0x4cadba(0x166)];else{if(this[_0x4cadba(0x227)]['process']?.[_0x4cadba(0x1ff)])_0x5abb6d=this['global'][_0x4cadba(0x168)]?.[_0x4cadba(0x1ff)];else try{let _0x2f8195=await import(_0x4cadba(0x21b));_0x5abb6d=(await import((await import(_0x4cadba(0x24a)))['pathToFileURL'](_0x2f8195['join'](this[_0x4cadba(0x18a)],'ws/index.js'))['toString']()))[_0x4cadba(0x233)];}catch{try{_0x5abb6d=require(require(_0x4cadba(0x21b))[_0x4cadba(0x1d4)](this[_0x4cadba(0x18a)],'ws'));}catch{throw new Error(_0x4cadba(0x188));}}}return this[_0x4cadba(0x1d6)]=_0x5abb6d,_0x5abb6d;}[_0x12c47f(0x224)](){var _0x21ad7d=_0x12c47f;this['_connecting']||this['_connected']||this[_0x21ad7d(0x1e0)]>=this[_0x21ad7d(0x163)]||(this['_allowedToConnectOnSend']=!0x1,this['_connecting']=!0x0,this[_0x21ad7d(0x1e0)]++,this[_0x21ad7d(0x22d)]=new Promise((_0x823a16,_0x3a3860)=>{var _0x3aa4e7=_0x21ad7d;this[_0x3aa4e7(0x18c)]()[_0x3aa4e7(0x1c6)](_0x4d422c=>{var _0xb7e2dd=_0x3aa4e7;let _0x44cbd3=new _0x4d422c('ws://'+(!this[_0xb7e2dd(0x197)]&&this[_0xb7e2dd(0x16c)]?_0xb7e2dd(0x1f9):this[_0xb7e2dd(0x1a0)])+':'+this[_0xb7e2dd(0x1ab)]);_0x44cbd3['onerror']=()=>{var _0x235006=_0xb7e2dd;this[_0x235006(0x1b5)]=!0x1,this[_0x235006(0x20a)](_0x44cbd3),this['_attemptToReconnectShortly'](),_0x3a3860(new Error(_0x235006(0x173)));},_0x44cbd3['onopen']=()=>{var _0x1bd03c=_0xb7e2dd;this[_0x1bd03c(0x197)]||_0x44cbd3[_0x1bd03c(0x231)]&&_0x44cbd3[_0x1bd03c(0x231)][_0x1bd03c(0x1b0)]&&_0x44cbd3[_0x1bd03c(0x231)][_0x1bd03c(0x1b0)](),_0x823a16(_0x44cbd3);},_0x44cbd3['onclose']=()=>{var _0x5b55c8=_0xb7e2dd;this['_allowedToConnectOnSend']=!0x0,this['_disposeWebsocket'](_0x44cbd3),this[_0x5b55c8(0x225)]();},_0x44cbd3[_0xb7e2dd(0x198)]=_0x437b20=>{var _0x25dead=_0xb7e2dd;try{_0x437b20&&_0x437b20[_0x25dead(0x230)]&&this[_0x25dead(0x197)]&&JSON[_0x25dead(0x1d2)](_0x437b20[_0x25dead(0x230)])['method']===_0x25dead(0x1da)&&this[_0x25dead(0x227)][_0x25dead(0x17f)][_0x25dead(0x1da)]();}catch{}};})[_0x3aa4e7(0x1c6)](_0x47a542=>(this[_0x3aa4e7(0x1d0)]=!0x0,this[_0x3aa4e7(0x235)]=!0x1,this[_0x3aa4e7(0x23d)]=!0x1,this['_allowedToSend']=!0x0,this[_0x3aa4e7(0x1e0)]=0x0,_0x47a542))[_0x3aa4e7(0x16a)](_0x2b2034=>(this['_connected']=!0x1,this['_connecting']=!0x1,console[_0x3aa4e7(0x1fe)](_0x3aa4e7(0x228)+this[_0x3aa4e7(0x17c)]),_0x3a3860(new Error(_0x3aa4e7(0x229)+(_0x2b2034&&_0x2b2034[_0x3aa4e7(0x181)])))));}));}[_0x12c47f(0x20a)](_0xbc6464){var _0x3ad943=_0x12c47f;this[_0x3ad943(0x1d0)]=!0x1,this[_0x3ad943(0x235)]=!0x1;try{_0xbc6464[_0x3ad943(0x1e4)]=null,_0xbc6464[_0x3ad943(0x1a1)]=null,_0xbc6464[_0x3ad943(0x17a)]=null;}catch{}try{_0xbc6464[_0x3ad943(0x18e)]<0x2&&_0xbc6464['close']();}catch{}}[_0x12c47f(0x225)](){var _0x12cd49=_0x12c47f;clearTimeout(this[_0x12cd49(0x244)]),!(this['_connectAttemptCount']>=this[_0x12cd49(0x163)])&&(this['_reconnectTimeout']=setTimeout(()=>{var _0x588246=_0x12cd49;this[_0x588246(0x1d0)]||this['_connecting']||(this[_0x588246(0x224)](),this[_0x588246(0x22d)]?.['catch'](()=>this[_0x588246(0x225)]()));},0x1f4),this[_0x12cd49(0x244)][_0x12cd49(0x1b0)]&&this[_0x12cd49(0x244)]['unref']());}async[_0x12c47f(0x200)](_0x34ebe4){var _0x18d749=_0x12c47f;try{if(!this[_0x18d749(0x1b5)])return;this[_0x18d749(0x23d)]&&this['_connectToHostNow'](),(await this[_0x18d749(0x22d)])['send'](JSON[_0x18d749(0x184)](_0x34ebe4));}catch(_0x5ab0fc){console[_0x18d749(0x1fe)](this['_sendErrorMessage']+':\\x20'+(_0x5ab0fc&&_0x5ab0fc[_0x18d749(0x181)])),this[_0x18d749(0x1b5)]=!0x1,this[_0x18d749(0x225)]();}}};function b(_0x16cfcc,_0x484b75,_0xb420ec,_0x51b7ad,_0x1fd050,_0x4ee1f9){var _0x578164=_0x12c47f;let _0x2dfffa=_0xb420ec[_0x578164(0x1a3)](',')['map'](_0x143e55=>{var _0x20d9d7=_0x578164;try{_0x16cfcc[_0x20d9d7(0x1c3)]||((_0x1fd050===_0x20d9d7(0x1d5)||_0x1fd050===_0x20d9d7(0x20f)||_0x1fd050===_0x20d9d7(0x1b9)||_0x1fd050===_0x20d9d7(0x21d))&&(_0x1fd050+=!_0x16cfcc[_0x20d9d7(0x168)]?.[_0x20d9d7(0x189)]?.[_0x20d9d7(0x162)]&&_0x16cfcc['process']?.[_0x20d9d7(0x1ef)]?.[_0x20d9d7(0x18f)]!==_0x20d9d7(0x215)?_0x20d9d7(0x16e):_0x20d9d7(0x24b)),_0x16cfcc[_0x20d9d7(0x1c3)]={'id':+new Date(),'tool':_0x1fd050});let _0x571ffb=new X(_0x16cfcc,_0x484b75,_0x143e55,_0x51b7ad,_0x4ee1f9);return _0x571ffb[_0x20d9d7(0x200)][_0x20d9d7(0x19b)](_0x571ffb);}catch(_0x31ba95){return console[_0x20d9d7(0x1fe)]('logger\\x20failed\\x20to\\x20connect\\x20to\\x20host',_0x31ba95&&_0x31ba95[_0x20d9d7(0x181)]),()=>{};}});return _0x5d733b=>_0x2dfffa[_0x578164(0x20d)](_0x5e84b4=>_0x5e84b4(_0x5d733b));}function W(_0x15621a){var _0x111d9=_0x12c47f;let _0x503751=function(_0x4f6b6e,_0x44baf8){return _0x44baf8-_0x4f6b6e;},_0x103972;if(_0x15621a['performance'])_0x103972=function(){var _0x5b7c3d=_0x341f;return _0x15621a[_0x5b7c3d(0x239)][_0x5b7c3d(0x187)]();};else{if(_0x15621a['process']&&_0x15621a['process']['hrtime']&&_0x15621a[_0x111d9(0x168)]?.['env']?.[_0x111d9(0x18f)]!==_0x111d9(0x215))_0x103972=function(){var _0x40c619=_0x111d9;return _0x15621a[_0x40c619(0x168)][_0x40c619(0x218)]();},_0x503751=function(_0x19b88c,_0x174ce6){return 0x3e8*(_0x174ce6[0x0]-_0x19b88c[0x0])+(_0x174ce6[0x1]-_0x19b88c[0x1])/0xf4240;};else try{let {performance:_0x35e6dd}=require(_0x111d9(0x213));_0x103972=function(){return _0x35e6dd['now']();};}catch{_0x103972=function(){return+new Date();};}}return{'elapsed':_0x503751,'timeStamp':_0x103972,'now':()=>Date['now']()};}function J(_0x2a1a5c,_0x3104db,_0x233151){var _0xde5036=_0x12c47f;if(_0x2a1a5c['_consoleNinjaAllowedToStart']!==void 0x0)return _0x2a1a5c['_consoleNinjaAllowedToStart'];let _0xb3e7a2=_0x2a1a5c[_0xde5036(0x168)]?.[_0xde5036(0x189)]?.[_0xde5036(0x162)]||_0x2a1a5c['process']?.[_0xde5036(0x1ef)]?.['NEXT_RUNTIME']===_0xde5036(0x215);return _0xb3e7a2&&_0x233151==='nuxt'?_0x2a1a5c[_0xde5036(0x193)]=!0x1:_0x2a1a5c[_0xde5036(0x193)]=_0xb3e7a2||!_0x3104db||_0x2a1a5c[_0xde5036(0x17f)]?.[_0xde5036(0x242)]&&_0x3104db[_0xde5036(0x1b1)](_0x2a1a5c['location'][_0xde5036(0x242)]),_0x2a1a5c[_0xde5036(0x193)];}function Y(_0x2d02e6,_0x3ac908,_0xe3ec79,_0xc6c657){var _0x1c22b8=_0x12c47f;_0x2d02e6=_0x2d02e6,_0x3ac908=_0x3ac908,_0xe3ec79=_0xe3ec79,_0xc6c657=_0xc6c657;let _0x397d58=W(_0x2d02e6),_0xeea918=_0x397d58[_0x1c22b8(0x18d)],_0x1b05b2=_0x397d58[_0x1c22b8(0x21a)];class _0x3c254e{constructor(){var _0x43a4e7=_0x1c22b8;this['_keyStrRegExp']=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this[_0x43a4e7(0x179)]=/^(0|[1-9][0-9]*)$/,this[_0x43a4e7(0x248)]=/'([^\\\\']|\\\\')*'/,this[_0x43a4e7(0x1f5)]=_0x2d02e6[_0x43a4e7(0x1d1)],this['_HTMLAllCollection']=_0x2d02e6['HTMLAllCollection'],this[_0x43a4e7(0x1dd)]=Object[_0x43a4e7(0x240)],this[_0x43a4e7(0x1d3)]=Object[_0x43a4e7(0x24c)],this['_Symbol']=_0x2d02e6['Symbol'],this['_regExpToString']=RegExp[_0x43a4e7(0x1de)][_0x43a4e7(0x1fc)],this[_0x43a4e7(0x1d8)]=Date[_0x43a4e7(0x1de)][_0x43a4e7(0x1fc)];}['serialize'](_0x47251c,_0x48c524,_0x42dbb1,_0x5ee62d){var _0x396d0f=_0x1c22b8,_0x4a455d=this,_0x2b3c2a=_0x42dbb1[_0x396d0f(0x174)];function _0x329cf7(_0xf00d3c,_0x163298,_0x17eb9e){var _0x3a2a65=_0x396d0f;_0x163298[_0x3a2a65(0x202)]=_0x3a2a65(0x19d),_0x163298['error']=_0xf00d3c[_0x3a2a65(0x181)],_0x3c5117=_0x17eb9e[_0x3a2a65(0x162)][_0x3a2a65(0x206)],_0x17eb9e[_0x3a2a65(0x162)][_0x3a2a65(0x206)]=_0x163298,_0x4a455d[_0x3a2a65(0x19e)](_0x163298,_0x17eb9e);}try{_0x42dbb1[_0x396d0f(0x1ec)]++,_0x42dbb1[_0x396d0f(0x174)]&&_0x42dbb1['autoExpandPreviousObjects']['push'](_0x48c524);var _0x258082,_0xf4127,_0x5ce2af,_0x261f39,_0x11d8c9=[],_0x364dc7=[],_0x2314cf,_0xe705ce=this[_0x396d0f(0x1cc)](_0x48c524),_0x460077=_0xe705ce===_0x396d0f(0x165),_0x5c7b2b=!0x1,_0x390cbd=_0xe705ce===_0x396d0f(0x177),_0x1f269b=this['_isPrimitiveType'](_0xe705ce),_0x2e13d2=this[_0x396d0f(0x1c8)](_0xe705ce),_0xa3a055=_0x1f269b||_0x2e13d2,_0x4a55ac={},_0x50404e=0x0,_0xa31672=!0x1,_0x3c5117,_0x2b54a4=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x42dbb1[_0x396d0f(0x1b8)]){if(_0x460077){if(_0xf4127=_0x48c524[_0x396d0f(0x1ce)],_0xf4127>_0x42dbb1['elements']){for(_0x5ce2af=0x0,_0x261f39=_0x42dbb1['elements'],_0x258082=_0x5ce2af;_0x258082<_0x261f39;_0x258082++)_0x364dc7[_0x396d0f(0x1bf)](_0x4a455d['_addProperty'](_0x11d8c9,_0x48c524,_0xe705ce,_0x258082,_0x42dbb1));_0x47251c[_0x396d0f(0x23f)]=!0x0;}else{for(_0x5ce2af=0x0,_0x261f39=_0xf4127,_0x258082=_0x5ce2af;_0x258082<_0x261f39;_0x258082++)_0x364dc7[_0x396d0f(0x1bf)](_0x4a455d['_addProperty'](_0x11d8c9,_0x48c524,_0xe705ce,_0x258082,_0x42dbb1));}_0x42dbb1['autoExpandPropertyCount']+=_0x364dc7['length'];}if(!(_0xe705ce===_0x396d0f(0x175)||_0xe705ce==='undefined')&&!_0x1f269b&&_0xe705ce!==_0x396d0f(0x16b)&&_0xe705ce!==_0x396d0f(0x1fd)&&_0xe705ce!=='bigint'){var _0x7dc11f=_0x5ee62d[_0x396d0f(0x221)]||_0x42dbb1[_0x396d0f(0x221)];if(this['_isSet'](_0x48c524)?(_0x258082=0x0,_0x48c524[_0x396d0f(0x20d)](function(_0xe8506a){var _0x287f3a=_0x396d0f;if(_0x50404e++,_0x42dbb1[_0x287f3a(0x1e5)]++,_0x50404e>_0x7dc11f){_0xa31672=!0x0;return;}if(!_0x42dbb1[_0x287f3a(0x1a5)]&&_0x42dbb1[_0x287f3a(0x174)]&&_0x42dbb1[_0x287f3a(0x1e5)]>_0x42dbb1['autoExpandLimit']){_0xa31672=!0x0;return;}_0x364dc7['push'](_0x4a455d[_0x287f3a(0x1e9)](_0x11d8c9,_0x48c524,_0x287f3a(0x1fa),_0x258082++,_0x42dbb1,function(_0x556cb0){return function(){return _0x556cb0;};}(_0xe8506a)));})):this[_0x396d0f(0x160)](_0x48c524)&&_0x48c524[_0x396d0f(0x20d)](function(_0x327361,_0x2d6c5f){var _0x3e3dd1=_0x396d0f;if(_0x50404e++,_0x42dbb1[_0x3e3dd1(0x1e5)]++,_0x50404e>_0x7dc11f){_0xa31672=!0x0;return;}if(!_0x42dbb1['isExpressionToEvaluate']&&_0x42dbb1[_0x3e3dd1(0x174)]&&_0x42dbb1[_0x3e3dd1(0x1e5)]>_0x42dbb1['autoExpandLimit']){_0xa31672=!0x0;return;}var _0x11d6b5=_0x2d6c5f[_0x3e3dd1(0x1fc)]();_0x11d6b5[_0x3e3dd1(0x1ce)]>0x64&&(_0x11d6b5=_0x11d6b5[_0x3e3dd1(0x232)](0x0,0x64)+_0x3e3dd1(0x21c)),_0x364dc7[_0x3e3dd1(0x1bf)](_0x4a455d['_addProperty'](_0x11d8c9,_0x48c524,_0x3e3dd1(0x1aa),_0x11d6b5,_0x42dbb1,function(_0x23378b){return function(){return _0x23378b;};}(_0x327361)));}),!_0x5c7b2b){try{for(_0x2314cf in _0x48c524)if(!(_0x460077&&_0x2b54a4['test'](_0x2314cf))&&!this[_0x396d0f(0x20b)](_0x48c524,_0x2314cf,_0x42dbb1)){if(_0x50404e++,_0x42dbb1[_0x396d0f(0x1e5)]++,_0x50404e>_0x7dc11f){_0xa31672=!0x0;break;}if(!_0x42dbb1[_0x396d0f(0x1a5)]&&_0x42dbb1[_0x396d0f(0x174)]&&_0x42dbb1[_0x396d0f(0x1e5)]>_0x42dbb1[_0x396d0f(0x1d7)]){_0xa31672=!0x0;break;}_0x364dc7[_0x396d0f(0x1bf)](_0x4a455d[_0x396d0f(0x1ee)](_0x11d8c9,_0x4a55ac,_0x48c524,_0xe705ce,_0x2314cf,_0x42dbb1));}}catch{}if(_0x4a55ac[_0x396d0f(0x1bc)]=!0x0,_0x390cbd&&(_0x4a55ac[_0x396d0f(0x1e6)]=!0x0),!_0xa31672){var _0x4b5f06=[][_0x396d0f(0x236)](this[_0x396d0f(0x1d3)](_0x48c524))[_0x396d0f(0x236)](this[_0x396d0f(0x210)](_0x48c524));for(_0x258082=0x0,_0xf4127=_0x4b5f06['length'];_0x258082<_0xf4127;_0x258082++)if(_0x2314cf=_0x4b5f06[_0x258082],!(_0x460077&&_0x2b54a4[_0x396d0f(0x21f)](_0x2314cf[_0x396d0f(0x1fc)]()))&&!this[_0x396d0f(0x20b)](_0x48c524,_0x2314cf,_0x42dbb1)&&!_0x4a55ac[_0x396d0f(0x1b6)+_0x2314cf[_0x396d0f(0x1fc)]()]){if(_0x50404e++,_0x42dbb1[_0x396d0f(0x1e5)]++,_0x50404e>_0x7dc11f){_0xa31672=!0x0;break;}if(!_0x42dbb1['isExpressionToEvaluate']&&_0x42dbb1[_0x396d0f(0x174)]&&_0x42dbb1[_0x396d0f(0x1e5)]>_0x42dbb1[_0x396d0f(0x1d7)]){_0xa31672=!0x0;break;}_0x364dc7['push'](_0x4a455d['_addObjectProperty'](_0x11d8c9,_0x4a55ac,_0x48c524,_0xe705ce,_0x2314cf,_0x42dbb1));}}}}}if(_0x47251c[_0x396d0f(0x202)]=_0xe705ce,_0xa3a055?(_0x47251c['value']=_0x48c524['valueOf'](),this[_0x396d0f(0x186)](_0xe705ce,_0x47251c,_0x42dbb1,_0x5ee62d)):_0xe705ce===_0x396d0f(0x223)?_0x47251c[_0x396d0f(0x1f3)]=this[_0x396d0f(0x1d8)][_0x396d0f(0x176)](_0x48c524):_0xe705ce===_0x396d0f(0x247)?_0x47251c[_0x396d0f(0x1f3)]=_0x48c524[_0x396d0f(0x1fc)]():_0xe705ce===_0x396d0f(0x222)?_0x47251c[_0x396d0f(0x1f3)]=this[_0x396d0f(0x1eb)][_0x396d0f(0x176)](_0x48c524):_0xe705ce===_0x396d0f(0x1dc)&&this[_0x396d0f(0x172)]?_0x47251c[_0x396d0f(0x1f3)]=this[_0x396d0f(0x172)]['prototype']['toString']['call'](_0x48c524):!_0x42dbb1['depth']&&!(_0xe705ce==='null'||_0xe705ce===_0x396d0f(0x1d1))&&(delete _0x47251c['value'],_0x47251c['capped']=!0x0),_0xa31672&&(_0x47251c[_0x396d0f(0x1c1)]=!0x0),_0x3c5117=_0x42dbb1[_0x396d0f(0x162)][_0x396d0f(0x206)],_0x42dbb1[_0x396d0f(0x162)]['current']=_0x47251c,this[_0x396d0f(0x19e)](_0x47251c,_0x42dbb1),_0x364dc7[_0x396d0f(0x1ce)]){for(_0x258082=0x0,_0xf4127=_0x364dc7[_0x396d0f(0x1ce)];_0x258082<_0xf4127;_0x258082++)_0x364dc7[_0x258082](_0x258082);}_0x11d8c9['length']&&(_0x47251c[_0x396d0f(0x221)]=_0x11d8c9);}catch(_0xcfa7a0){_0x329cf7(_0xcfa7a0,_0x47251c,_0x42dbb1);}return this[_0x396d0f(0x1df)](_0x48c524,_0x47251c),this['_treeNodePropertiesAfterFullValue'](_0x47251c,_0x42dbb1),_0x42dbb1['node'][_0x396d0f(0x206)]=_0x3c5117,_0x42dbb1[_0x396d0f(0x1ec)]--,_0x42dbb1[_0x396d0f(0x174)]=_0x2b3c2a,_0x42dbb1[_0x396d0f(0x174)]&&_0x42dbb1[_0x396d0f(0x250)][_0x396d0f(0x196)](),_0x47251c;}[_0x1c22b8(0x210)](_0x672991){var _0x9ccdc3=_0x1c22b8;return Object[_0x9ccdc3(0x23a)]?Object[_0x9ccdc3(0x23a)](_0x672991):[];}[_0x1c22b8(0x238)](_0xde0740){var _0x539c78=_0x1c22b8;return!!(_0xde0740&&_0x2d02e6['Set']&&this[_0x539c78(0x1ea)](_0xde0740)===_0x539c78(0x249)&&_0xde0740['forEach']);}[_0x1c22b8(0x20b)](_0x3c20ec,_0x327190,_0x2ae08f){var _0x3a9b8b=_0x1c22b8;return _0x2ae08f[_0x3a9b8b(0x22e)]?typeof _0x3c20ec[_0x327190]==_0x3a9b8b(0x177):!0x1;}[_0x1c22b8(0x1cc)](_0x30ef19){var _0x21129e=_0x1c22b8,_0x55fadc='';return _0x55fadc=typeof _0x30ef19,_0x55fadc==='object'?this[_0x21129e(0x1ea)](_0x30ef19)===_0x21129e(0x1a8)?_0x55fadc='array':this[_0x21129e(0x1ea)](_0x30ef19)===_0x21129e(0x205)?_0x55fadc=_0x21129e(0x223):this[_0x21129e(0x1ea)](_0x30ef19)===_0x21129e(0x17d)?_0x55fadc=_0x21129e(0x247):_0x30ef19===null?_0x55fadc=_0x21129e(0x175):_0x30ef19[_0x21129e(0x169)]&&(_0x55fadc=_0x30ef19[_0x21129e(0x169)][_0x21129e(0x208)]||_0x55fadc):_0x55fadc==='undefined'&&this['_HTMLAllCollection']&&_0x30ef19 instanceof this['_HTMLAllCollection']&&(_0x55fadc='HTMLAllCollection'),_0x55fadc;}['_objectToString'](_0x574ba5){var _0x5dd75e=_0x1c22b8;return Object[_0x5dd75e(0x1de)]['toString'][_0x5dd75e(0x176)](_0x574ba5);}[_0x1c22b8(0x1a4)](_0x1c2f0f){var _0x435b81=_0x1c22b8;return _0x1c2f0f===_0x435b81(0x22f)||_0x1c2f0f==='string'||_0x1c2f0f===_0x435b81(0x1ae);}[_0x1c22b8(0x1c8)](_0x5982a8){var _0x392aca=_0x1c22b8;return _0x5982a8===_0x392aca(0x1c0)||_0x5982a8==='String'||_0x5982a8===_0x392aca(0x1f2);}['_addProperty'](_0x33bb2c,_0x486242,_0x506ede,_0x27ebd9,_0xc20249,_0x90b162){var _0x57d374=this;return function(_0x49f588){var _0xae69c3=_0x341f,_0x5bfa33=_0xc20249[_0xae69c3(0x162)][_0xae69c3(0x206)],_0x3f459e=_0xc20249[_0xae69c3(0x162)][_0xae69c3(0x1af)],_0x1bc60d=_0xc20249[_0xae69c3(0x162)]['parent'];_0xc20249[_0xae69c3(0x162)][_0xae69c3(0x1c7)]=_0x5bfa33,_0xc20249['node']['index']=typeof _0x27ebd9==_0xae69c3(0x1ae)?_0x27ebd9:_0x49f588,_0x33bb2c[_0xae69c3(0x1bf)](_0x57d374[_0xae69c3(0x1e3)](_0x486242,_0x506ede,_0x27ebd9,_0xc20249,_0x90b162)),_0xc20249[_0xae69c3(0x162)]['parent']=_0x1bc60d,_0xc20249[_0xae69c3(0x162)]['index']=_0x3f459e;};}[_0x1c22b8(0x1ee)](_0x12a86d,_0x1f9037,_0x37978d,_0x3abbf9,_0x499266,_0x3a0280,_0x396298){var _0x2f6e6c=_0x1c22b8,_0x4f9212=this;return _0x1f9037[_0x2f6e6c(0x1b6)+_0x499266[_0x2f6e6c(0x1fc)]()]=!0x0,function(_0x2653f8){var _0x15dc5d=_0x2f6e6c,_0x54eff4=_0x3a0280[_0x15dc5d(0x162)]['current'],_0x3b0271=_0x3a0280[_0x15dc5d(0x162)]['index'],_0x2edfee=_0x3a0280['node'][_0x15dc5d(0x1c7)];_0x3a0280['node'][_0x15dc5d(0x1c7)]=_0x54eff4,_0x3a0280['node'][_0x15dc5d(0x1af)]=_0x2653f8,_0x12a86d['push'](_0x4f9212['_property'](_0x37978d,_0x3abbf9,_0x499266,_0x3a0280,_0x396298)),_0x3a0280[_0x15dc5d(0x162)][_0x15dc5d(0x1c7)]=_0x2edfee,_0x3a0280[_0x15dc5d(0x162)][_0x15dc5d(0x1af)]=_0x3b0271;};}['_property'](_0x39474c,_0x14ec8c,_0x4fdb13,_0x22e8c6,_0x4f87f1){var _0x32a4b2=_0x1c22b8,_0x223958=this;_0x4f87f1||(_0x4f87f1=function(_0x4919fd,_0x33ded8){return _0x4919fd[_0x33ded8];});var _0xf6b87e=_0x4fdb13[_0x32a4b2(0x1fc)](),_0x3c0a9b=_0x22e8c6[_0x32a4b2(0x211)]||{},_0x3f172b=_0x22e8c6[_0x32a4b2(0x1b8)],_0x221ae4=_0x22e8c6[_0x32a4b2(0x1a5)];try{var _0x32044f=this[_0x32a4b2(0x160)](_0x39474c),_0x32945a=_0xf6b87e;_0x32044f&&_0x32945a[0x0]==='\\x27'&&(_0x32945a=_0x32945a[_0x32a4b2(0x1f7)](0x1,_0x32945a[_0x32a4b2(0x1ce)]-0x2));var _0x1637bd=_0x22e8c6['expressionsToEvaluate']=_0x3c0a9b[_0x32a4b2(0x1b6)+_0x32945a];_0x1637bd&&(_0x22e8c6[_0x32a4b2(0x1b8)]=_0x22e8c6[_0x32a4b2(0x1b8)]+0x1),_0x22e8c6[_0x32a4b2(0x1a5)]=!!_0x1637bd;var _0x2a6d51=typeof _0x4fdb13==_0x32a4b2(0x1dc),_0x544c88={'name':_0x2a6d51||_0x32044f?_0xf6b87e:this['_propertyName'](_0xf6b87e)};if(_0x2a6d51&&(_0x544c88[_0x32a4b2(0x1dc)]=!0x0),!(_0x14ec8c===_0x32a4b2(0x165)||_0x14ec8c===_0x32a4b2(0x180))){var _0x245f3b=this[_0x32a4b2(0x1dd)](_0x39474c,_0x4fdb13);if(_0x245f3b&&(_0x245f3b[_0x32a4b2(0x185)]&&(_0x544c88[_0x32a4b2(0x194)]=!0x0),_0x245f3b[_0x32a4b2(0x24d)]&&!_0x1637bd&&!_0x22e8c6['resolveGetters']))return _0x544c88[_0x32a4b2(0x23e)]=!0x0,this['_processTreeNodeResult'](_0x544c88,_0x22e8c6),_0x544c88;}var _0x179319;try{_0x179319=_0x4f87f1(_0x39474c,_0x4fdb13);}catch(_0x1afb69){return _0x544c88={'name':_0xf6b87e,'type':'unknown','error':_0x1afb69['message']},this[_0x32a4b2(0x201)](_0x544c88,_0x22e8c6),_0x544c88;}var _0x313c10=this['_type'](_0x179319),_0x29c989=this[_0x32a4b2(0x1a4)](_0x313c10);if(_0x544c88[_0x32a4b2(0x202)]=_0x313c10,_0x29c989)this[_0x32a4b2(0x201)](_0x544c88,_0x22e8c6,_0x179319,function(){var _0x5599a0=_0x32a4b2;_0x544c88[_0x5599a0(0x1f3)]=_0x179319['valueOf'](),!_0x1637bd&&_0x223958[_0x5599a0(0x186)](_0x313c10,_0x544c88,_0x22e8c6,{});});else{var _0x406654=_0x22e8c6[_0x32a4b2(0x174)]&&_0x22e8c6[_0x32a4b2(0x1ec)]<_0x22e8c6['autoExpandMaxDepth']&&_0x22e8c6['autoExpandPreviousObjects']['indexOf'](_0x179319)<0x0&&_0x313c10!=='function'&&_0x22e8c6['autoExpandPropertyCount']<_0x22e8c6[_0x32a4b2(0x1d7)];_0x406654||_0x22e8c6[_0x32a4b2(0x1ec)]<_0x3f172b||_0x1637bd?(this[_0x32a4b2(0x1ca)](_0x544c88,_0x179319,_0x22e8c6,_0x1637bd||{}),this[_0x32a4b2(0x1df)](_0x179319,_0x544c88)):this[_0x32a4b2(0x201)](_0x544c88,_0x22e8c6,_0x179319,function(){var _0x1c7d10=_0x32a4b2;_0x313c10===_0x1c7d10(0x175)||_0x313c10===_0x1c7d10(0x1d1)||(delete _0x544c88['value'],_0x544c88[_0x1c7d10(0x1b3)]=!0x0);});}return _0x544c88;}finally{_0x22e8c6[_0x32a4b2(0x211)]=_0x3c0a9b,_0x22e8c6[_0x32a4b2(0x1b8)]=_0x3f172b,_0x22e8c6['isExpressionToEvaluate']=_0x221ae4;}}['_capIfString'](_0x5d5f64,_0x4f6944,_0x273572,_0x5c12a2){var _0x485068=_0x1c22b8,_0x29ec16=_0x5c12a2['strLength']||_0x273572[_0x485068(0x24e)];if((_0x5d5f64===_0x485068(0x1c4)||_0x5d5f64===_0x485068(0x16b))&&_0x4f6944['value']){let _0x42c7ac=_0x4f6944['value']['length'];_0x273572[_0x485068(0x1f6)]+=_0x42c7ac,_0x273572[_0x485068(0x1f6)]>_0x273572[_0x485068(0x161)]?(_0x4f6944[_0x485068(0x1b3)]='',delete _0x4f6944['value']):_0x42c7ac>_0x29ec16&&(_0x4f6944[_0x485068(0x1b3)]=_0x4f6944[_0x485068(0x1f3)][_0x485068(0x1f7)](0x0,_0x29ec16),delete _0x4f6944['value']);}}['_isMap'](_0x163e75){var _0x40feb0=_0x1c22b8;return!!(_0x163e75&&_0x2d02e6[_0x40feb0(0x1aa)]&&this[_0x40feb0(0x1ea)](_0x163e75)===_0x40feb0(0x1bb)&&_0x163e75[_0x40feb0(0x20d)]);}[_0x1c22b8(0x192)](_0x3da9e1){var _0x488a1f=_0x1c22b8;if(_0x3da9e1['match'](/^\\d+$/))return _0x3da9e1;var _0x32e9f0;try{_0x32e9f0=JSON[_0x488a1f(0x184)](''+_0x3da9e1);}catch{_0x32e9f0='\\x22'+this['_objectToString'](_0x3da9e1)+'\\x22';}return _0x32e9f0['match'](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x32e9f0=_0x32e9f0['substr'](0x1,_0x32e9f0[_0x488a1f(0x1ce)]-0x2):_0x32e9f0=_0x32e9f0['replace'](/'/g,'\\x5c\\x27')['replace'](/\\\\\"/g,'\\x22')['replace'](/(^\"|\"$)/g,'\\x27'),_0x32e9f0;}[_0x1c22b8(0x201)](_0xb370ff,_0x38f2ac,_0x5e4b7e,_0x106b79){var _0x38cb27=_0x1c22b8;this[_0x38cb27(0x19e)](_0xb370ff,_0x38f2ac),_0x106b79&&_0x106b79(),this[_0x38cb27(0x1df)](_0x5e4b7e,_0xb370ff),this['_treeNodePropertiesAfterFullValue'](_0xb370ff,_0x38f2ac);}[_0x1c22b8(0x19e)](_0x2905a0,_0x217982){var _0x2f3009=_0x1c22b8;this[_0x2f3009(0x24f)](_0x2905a0,_0x217982),this[_0x2f3009(0x19f)](_0x2905a0,_0x217982),this[_0x2f3009(0x1cd)](_0x2905a0,_0x217982),this[_0x2f3009(0x207)](_0x2905a0,_0x217982);}[_0x1c22b8(0x24f)](_0x3a06fa,_0x2381ad){}[_0x1c22b8(0x19f)](_0x2a31f3,_0x243337){}[_0x1c22b8(0x246)](_0x35900a,_0x3a6371){}[_0x1c22b8(0x183)](_0x540e9b){return _0x540e9b===this['_undefined'];}['_treeNodePropertiesAfterFullValue'](_0x14bdc9,_0x192538){var _0x1806e7=_0x1c22b8;this[_0x1806e7(0x246)](_0x14bdc9,_0x192538),this['_setNodeExpandableState'](_0x14bdc9),_0x192538[_0x1806e7(0x1b4)]&&this[_0x1806e7(0x234)](_0x14bdc9),this[_0x1806e7(0x1fb)](_0x14bdc9,_0x192538),this[_0x1806e7(0x182)](_0x14bdc9,_0x192538),this[_0x1806e7(0x1e8)](_0x14bdc9);}[_0x1c22b8(0x1df)](_0x459a70,_0x339e9f){var _0x5e76d5=_0x1c22b8;let _0x1924c3;try{_0x2d02e6['console']&&(_0x1924c3=_0x2d02e6[_0x5e76d5(0x1f0)][_0x5e76d5(0x16d)],_0x2d02e6[_0x5e76d5(0x1f0)][_0x5e76d5(0x16d)]=function(){}),_0x459a70&&typeof _0x459a70[_0x5e76d5(0x1ce)]==_0x5e76d5(0x1ae)&&(_0x339e9f[_0x5e76d5(0x1ce)]=_0x459a70['length']);}catch{}finally{_0x1924c3&&(_0x2d02e6[_0x5e76d5(0x1f0)]['error']=_0x1924c3);}if(_0x339e9f[_0x5e76d5(0x202)]===_0x5e76d5(0x1ae)||_0x339e9f['type']===_0x5e76d5(0x1f2)){if(isNaN(_0x339e9f['value']))_0x339e9f[_0x5e76d5(0x217)]=!0x0,delete _0x339e9f[_0x5e76d5(0x1f3)];else switch(_0x339e9f[_0x5e76d5(0x1f3)]){case Number[_0x5e76d5(0x20c)]:_0x339e9f[_0x5e76d5(0x209)]=!0x0,delete _0x339e9f[_0x5e76d5(0x1f3)];break;case Number[_0x5e76d5(0x245)]:_0x339e9f['negativeInfinity']=!0x0,delete _0x339e9f[_0x5e76d5(0x1f3)];break;case 0x0:this[_0x5e76d5(0x1cf)](_0x339e9f[_0x5e76d5(0x1f3)])&&(_0x339e9f[_0x5e76d5(0x1f4)]=!0x0);break;}}else _0x339e9f['type']===_0x5e76d5(0x177)&&typeof _0x459a70[_0x5e76d5(0x208)]==_0x5e76d5(0x1c4)&&_0x459a70[_0x5e76d5(0x208)]&&_0x339e9f[_0x5e76d5(0x208)]&&_0x459a70[_0x5e76d5(0x208)]!==_0x339e9f[_0x5e76d5(0x208)]&&(_0x339e9f[_0x5e76d5(0x1a9)]=_0x459a70[_0x5e76d5(0x208)]);}[_0x1c22b8(0x1cf)](_0xf76722){return 0x1/_0xf76722===Number['NEGATIVE_INFINITY'];}[_0x1c22b8(0x234)](_0x29084b){var _0x507367=_0x1c22b8;!_0x29084b['props']||!_0x29084b[_0x507367(0x221)][_0x507367(0x1ce)]||_0x29084b[_0x507367(0x202)]===_0x507367(0x165)||_0x29084b[_0x507367(0x202)]===_0x507367(0x1aa)||_0x29084b[_0x507367(0x202)]==='Set'||_0x29084b[_0x507367(0x221)][_0x507367(0x22b)](function(_0x1414ab,_0x5511c7){var _0x555151=_0x507367,_0x1a1117=_0x1414ab[_0x555151(0x208)][_0x555151(0x237)](),_0x5b7583=_0x5511c7[_0x555151(0x208)][_0x555151(0x237)]();return _0x1a1117<_0x5b7583?-0x1:_0x1a1117>_0x5b7583?0x1:0x0;});}['_addFunctionsNode'](_0x40aa8e,_0x51cdc8){var _0x35abcd=_0x1c22b8;if(!(_0x51cdc8[_0x35abcd(0x22e)]||!_0x40aa8e['props']||!_0x40aa8e[_0x35abcd(0x221)]['length'])){for(var _0x3daf4c=[],_0x392ae9=[],_0x2a9497=0x0,_0x5dfe90=_0x40aa8e['props'][_0x35abcd(0x1ce)];_0x2a9497<_0x5dfe90;_0x2a9497++){var _0x1cb8ea=_0x40aa8e[_0x35abcd(0x221)][_0x2a9497];_0x1cb8ea['type']===_0x35abcd(0x177)?_0x3daf4c[_0x35abcd(0x1bf)](_0x1cb8ea):_0x392ae9[_0x35abcd(0x1bf)](_0x1cb8ea);}if(!(!_0x392ae9[_0x35abcd(0x1ce)]||_0x3daf4c['length']<=0x1)){_0x40aa8e[_0x35abcd(0x221)]=_0x392ae9;var _0x37d771={'functionsNode':!0x0,'props':_0x3daf4c};this['_setNodeId'](_0x37d771,_0x51cdc8),this[_0x35abcd(0x246)](_0x37d771,_0x51cdc8),this[_0x35abcd(0x1c5)](_0x37d771),this[_0x35abcd(0x207)](_0x37d771,_0x51cdc8),_0x37d771['id']+='\\x20f',_0x40aa8e[_0x35abcd(0x221)][_0x35abcd(0x1f1)](_0x37d771);}}}['_addLoadNode'](_0x4f94f9,_0x3a8b57){}[_0x1c22b8(0x1c5)](_0x1916b2){}[_0x1c22b8(0x1b2)](_0x3deed2){var _0x1f0d81=_0x1c22b8;return Array[_0x1f0d81(0x19c)](_0x3deed2)||typeof _0x3deed2==_0x1f0d81(0x190)&&this['_objectToString'](_0x3deed2)===_0x1f0d81(0x1a8);}['_setNodePermissions'](_0x247473,_0x424c62){}['_cleanNode'](_0x395e0c){var _0x53383d=_0x1c22b8;delete _0x395e0c[_0x53383d(0x1cb)],delete _0x395e0c['_hasSetOnItsPath'],delete _0x395e0c[_0x53383d(0x164)];}[_0x1c22b8(0x1cd)](_0x5b3be9,_0x20f926){}}let _0x4d33ec=new _0x3c254e(),_0x1cd97c={'props':0x64,'elements':0x64,'strLength':0x400*0x32,'totalStrLength':0x400*0x32,'autoExpandLimit':0x1388,'autoExpandMaxDepth':0xa},_0x1a7893={'props':0x5,'elements':0x5,'strLength':0x100,'totalStrLength':0x100*0x3,'autoExpandLimit':0x1e,'autoExpandMaxDepth':0x2};function _0x8d6058(_0x3d884e,_0x3a50dc,_0x3a1086,_0x3c5749,_0x20ddc6,_0x26f0f5){var _0x1e28b8=_0x1c22b8;let _0x3f8a55,_0x3668bf;try{_0x3668bf=_0x1b05b2(),_0x3f8a55=_0xe3ec79[_0x3a50dc],!_0x3f8a55||_0x3668bf-_0x3f8a55['ts']>0x1f4&&_0x3f8a55['count']&&_0x3f8a55['time']/_0x3f8a55['count']<0x64?(_0xe3ec79[_0x3a50dc]=_0x3f8a55={'count':0x0,'time':0x0,'ts':_0x3668bf},_0xe3ec79[_0x1e28b8(0x1c2)]={}):_0x3668bf-_0xe3ec79[_0x1e28b8(0x1c2)]['ts']>0x32&&_0xe3ec79['hits']['count']&&_0xe3ec79[_0x1e28b8(0x1c2)][_0x1e28b8(0x203)]/_0xe3ec79[_0x1e28b8(0x1c2)][_0x1e28b8(0x23c)]<0x64&&(_0xe3ec79['hits']={});let _0x219271=[],_0x33899c=_0x3f8a55['reduceLimits']||_0xe3ec79[_0x1e28b8(0x1c2)]['reduceLimits']?_0x1a7893:_0x1cd97c,_0x4b74f4=_0x4e3639=>{var _0x3c3238=_0x1e28b8;let _0x426b6e={};return _0x426b6e[_0x3c3238(0x221)]=_0x4e3639[_0x3c3238(0x221)],_0x426b6e[_0x3c3238(0x178)]=_0x4e3639[_0x3c3238(0x178)],_0x426b6e[_0x3c3238(0x24e)]=_0x4e3639[_0x3c3238(0x24e)],_0x426b6e[_0x3c3238(0x161)]=_0x4e3639[_0x3c3238(0x161)],_0x426b6e[_0x3c3238(0x1d7)]=_0x4e3639['autoExpandLimit'],_0x426b6e[_0x3c3238(0x1e2)]=_0x4e3639['autoExpandMaxDepth'],_0x426b6e[_0x3c3238(0x1b4)]=!0x1,_0x426b6e['noFunctions']=!_0x3ac908,_0x426b6e[_0x3c3238(0x1b8)]=0x1,_0x426b6e[_0x3c3238(0x1ec)]=0x0,_0x426b6e[_0x3c3238(0x191)]='root_exp_id',_0x426b6e[_0x3c3238(0x212)]='root_exp',_0x426b6e[_0x3c3238(0x174)]=!0x0,_0x426b6e[_0x3c3238(0x250)]=[],_0x426b6e['autoExpandPropertyCount']=0x0,_0x426b6e[_0x3c3238(0x22c)]=!0x0,_0x426b6e[_0x3c3238(0x1f6)]=0x0,_0x426b6e['node']={'current':void 0x0,'parent':void 0x0,'index':0x0},_0x426b6e;};for(var _0xbd3a60=0x0;_0xbd3a60<_0x20ddc6[_0x1e28b8(0x1ce)];_0xbd3a60++)_0x219271['push'](_0x4d33ec[_0x1e28b8(0x1ca)]({'timeNode':_0x3d884e===_0x1e28b8(0x203)||void 0x0},_0x20ddc6[_0xbd3a60],_0x4b74f4(_0x33899c),{}));if(_0x3d884e===_0x1e28b8(0x170)){let _0x3fde84=Error[_0x1e28b8(0x1b7)];try{Error[_0x1e28b8(0x1b7)]=0x1/0x0,_0x219271[_0x1e28b8(0x1bf)](_0x4d33ec[_0x1e28b8(0x1ca)]({'stackNode':!0x0},new Error()[_0x1e28b8(0x1bd)],_0x4b74f4(_0x33899c),{'strLength':0x1/0x0}));}finally{Error[_0x1e28b8(0x1b7)]=_0x3fde84;}}return{'method':_0x1e28b8(0x1a7),'version':_0xc6c657,'args':[{'ts':_0x3a1086,'session':_0x3c5749,'args':_0x219271,'id':_0x3a50dc,'context':_0x26f0f5}]};}catch(_0x502fb2){return{'method':_0x1e28b8(0x1a7),'version':_0xc6c657,'args':[{'ts':_0x3a1086,'session':_0x3c5749,'args':[{'type':_0x1e28b8(0x19d),'error':_0x502fb2&&_0x502fb2[_0x1e28b8(0x181)]}],'id':_0x3a50dc,'context':_0x26f0f5}]};}finally{try{if(_0x3f8a55&&_0x3668bf){let _0x113db4=_0x1b05b2();_0x3f8a55[_0x1e28b8(0x23c)]++,_0x3f8a55['time']+=_0xeea918(_0x3668bf,_0x113db4),_0x3f8a55['ts']=_0x113db4,_0xe3ec79[_0x1e28b8(0x1c2)][_0x1e28b8(0x23c)]++,_0xe3ec79[_0x1e28b8(0x1c2)]['time']+=_0xeea918(_0x3668bf,_0x113db4),_0xe3ec79[_0x1e28b8(0x1c2)]['ts']=_0x113db4,(_0x3f8a55['count']>0x32||_0x3f8a55[_0x1e28b8(0x203)]>0x64)&&(_0x3f8a55[_0x1e28b8(0x1ed)]=!0x0),(_0xe3ec79[_0x1e28b8(0x1c2)][_0x1e28b8(0x23c)]>0x3e8||_0xe3ec79[_0x1e28b8(0x1c2)]['time']>0x12c)&&(_0xe3ec79[_0x1e28b8(0x1c2)][_0x1e28b8(0x1ed)]=!0x0);}}catch{}}}return _0x8d6058;}function _0x341f(_0x200ec3,_0x1032ab){var _0x4b6626=_0x4b66();return _0x341f=function(_0x341ff9,_0x29670b){_0x341ff9=_0x341ff9-0x160;var _0x4a1dc5=_0x4b6626[_0x341ff9];return _0x4a1dc5;},_0x341f(_0x200ec3,_0x1032ab);}((_0x56c8d4,_0x172cd2,_0x16d12a,_0x4a1a8b,_0x16f8ae,_0x4e7e12,_0x44f374,_0x5e2b98,_0x558bd2,_0x5a80fb)=>{var _0x42bd1f=_0x12c47f;if(_0x56c8d4['_console_ninja'])return _0x56c8d4['_console_ninja'];if(!J(_0x56c8d4,_0x5e2b98,_0x16f8ae))return _0x56c8d4[_0x42bd1f(0x1c9)]={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}},_0x56c8d4[_0x42bd1f(0x1c9)];let _0x4fb100=W(_0x56c8d4),_0x43fff8=_0x4fb100[_0x42bd1f(0x18d)],_0x3cf443=_0x4fb100['timeStamp'],_0x5d236b=_0x4fb100['now'],_0x1f5fa9={'hits':{},'ts':{}},_0xbb7825=Y(_0x56c8d4,_0x558bd2,_0x1f5fa9,_0x4e7e12),_0x290a80=_0x1887ec=>{_0x1f5fa9['ts'][_0x1887ec]=_0x3cf443();},_0x5d480c=(_0x10ee54,_0x413758)=>{let _0x5ebc81=_0x1f5fa9['ts'][_0x413758];if(delete _0x1f5fa9['ts'][_0x413758],_0x5ebc81){let _0x3eaf89=_0x43fff8(_0x5ebc81,_0x3cf443());_0x320312(_0xbb7825('time',_0x10ee54,_0x5d236b(),_0x3bfac5,[_0x3eaf89],_0x413758));}},_0x4984cb=_0x123b27=>_0x456b20=>{var _0x413109=_0x42bd1f;try{_0x290a80(_0x456b20),_0x123b27(_0x456b20);}finally{_0x56c8d4[_0x413109(0x1f0)][_0x413109(0x203)]=_0x123b27;}},_0x2893ac=_0x32925d=>_0x5f4ca0=>{var _0x432a68=_0x42bd1f;try{let [_0x56ac7e,_0x57dd54]=_0x5f4ca0[_0x432a68(0x1a3)](_0x432a68(0x23b));_0x5d480c(_0x57dd54,_0x56ac7e),_0x32925d(_0x56ac7e);}finally{_0x56c8d4[_0x432a68(0x1f0)][_0x432a68(0x167)]=_0x32925d;}};_0x56c8d4[_0x42bd1f(0x1c9)]={'consoleLog':(_0x1777d9,_0x454cb4)=>{var _0x51ccf2=_0x42bd1f;_0x56c8d4['console'][_0x51ccf2(0x1a7)]['name']!==_0x51ccf2(0x17b)&&_0x320312(_0xbb7825(_0x51ccf2(0x1a7),_0x1777d9,_0x5d236b(),_0x3bfac5,_0x454cb4));},'consoleTrace':(_0x4cc588,_0x443f2b)=>{var _0x41c41e=_0x42bd1f;_0x56c8d4[_0x41c41e(0x1f0)]['log']['name']!==_0x41c41e(0x18b)&&_0x320312(_0xbb7825('trace',_0x4cc588,_0x5d236b(),_0x3bfac5,_0x443f2b));},'consoleTime':()=>{var _0x614515=_0x42bd1f;_0x56c8d4[_0x614515(0x1f0)][_0x614515(0x203)]=_0x4984cb(_0x56c8d4[_0x614515(0x1f0)][_0x614515(0x203)]);},'consoleTimeEnd':()=>{var _0x3a9c01=_0x42bd1f;_0x56c8d4[_0x3a9c01(0x1f0)][_0x3a9c01(0x167)]=_0x2893ac(_0x56c8d4[_0x3a9c01(0x1f0)][_0x3a9c01(0x167)]);},'autoLog':(_0x262c42,_0x47d477)=>{var _0x36fd67=_0x42bd1f;_0x320312(_0xbb7825(_0x36fd67(0x1a7),_0x47d477,_0x5d236b(),_0x3bfac5,[_0x262c42]));},'autoLogMany':(_0x1e4f71,_0x45e380)=>{_0x320312(_0xbb7825('log',_0x1e4f71,_0x5d236b(),_0x3bfac5,_0x45e380));},'autoTrace':(_0x3fbde2,_0x4f0e09)=>{var _0x467540=_0x42bd1f;_0x320312(_0xbb7825(_0x467540(0x170),_0x4f0e09,_0x5d236b(),_0x3bfac5,[_0x3fbde2]));},'autoTraceMany':(_0x507517,_0x537fb1)=>{_0x320312(_0xbb7825('trace',_0x507517,_0x5d236b(),_0x3bfac5,_0x537fb1));},'autoTime':(_0x18af83,_0x1d6b10,_0x3d7b3a)=>{_0x290a80(_0x3d7b3a);},'autoTimeEnd':(_0x188597,_0xada254,_0x4e4680)=>{_0x5d480c(_0xada254,_0x4e4680);},'coverage':_0x51a9a2=>{_0x320312({'method':'coverage','version':_0x4e7e12,'args':[{'id':_0x51a9a2}]});}};let _0x320312=b(_0x56c8d4,_0x172cd2,_0x16d12a,_0x4a1a8b,_0x16f8ae,_0x5a80fb),_0x3bfac5=_0x56c8d4[_0x42bd1f(0x1c3)];return _0x56c8d4[_0x42bd1f(0x1c9)];})(globalThis,_0x12c47f(0x20e),_0x12c47f(0x21e),_0x12c47f(0x195),_0x12c47f(0x1e1),_0x12c47f(0x19a),_0x12c47f(0x1ad),_0x12c47f(0x204),_0x12c47f(0x1f8),_0x12c47f(0x1be));");
}
catch (e) { } }
;
function oo_oo(i, ...v) { try {
    oo_cm().consoleLog(i, v);
}
catch (e) { } return v; }
;
oo_oo;
function oo_tr(i, ...v) { try {
    oo_cm().consoleTrace(i, v);
}
catch (e) { } return v; }
;
oo_tr;
function oo_ts() { try {
    oo_cm().consoleTime();
}
catch (e) { } }
;
oo_ts;
function oo_te() { try {
    oo_cm().consoleTimeEnd();
}
catch (e) { } }
;
oo_te;
//# sourceMappingURL=bot.service.js.map