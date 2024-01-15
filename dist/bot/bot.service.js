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
const TELEGRAM_TOKEN = '6772341762:AAFD7W55yv9i2OMUqnPb8hKOa6X-zXsuvqY';
let BotService = BotService_1 = class BotService {
    constructor() {
        this.logger = new common_1.Logger(BotService_1.name);
        this.onReceiveMessage = (msg) => {
            this.logger.debug(msg);
            const command = msg.text.toLowerCase();
            if (command === '/start') {
                this.sendMainMenu(msg.chat.id);
            }
            else {
                this.handleAirdropCommands(msg);
            }
        };
        this.sendMessageToUser = (userId, message) => {
            this.bot.sendMessage(userId, message);
        };
        this.sendMainMenu = (chatId) => {
            const message = 'Welcome! Choose an action:\n' +
                '/hottest - View hottest airdrops\n' +
                '/potential - View potential airdrops\n' +
                '/latest - View latest airdrops';
            this.sendMessageToUser(chatId, message);
        };
        this.handleAirdropCommands = (msg) => {
            const chatId = msg.chat.id;
            const command = msg.text.toLowerCase();
            switch (command) {
                case '/hottest':
                    this.sendHottestAirdrops(chatId);
                    break;
                case '/potential':
                    this.sendPotentialAirdrops(chatId);
                    break;
                case '/latest':
                    this.sendLatestAirdrops(chatId);
                    break;
                default:
                    this.sendMessageToUser(chatId, 'Unknown command. Please use /hottest, /potential, or /latest.');
            }
        };
        this.sendHottestAirdrops = (chatId) => {
            const message = 'List of hottest airdrops:\n1. Blast \n2. OKX \n3. Unigrap Protocol';
            this.sendMessageToUser(chatId, message);
            this.sendAirdropDetails(chatId, '🚀 Blast 🚀', `✅ Confirmed Airdrop from Blast`, 'Cost: 10 tokens');
            this.sendAirdropDetails(chatId, '🚀 Airdrop 2 🚀', 'Step 3, Step 4', 'Cost: 15 tokens');
            this.sendAirdropDetails(chatId, '🚀 Airdrop 3 🚀', 'Step 5, Step 6', 'Cost: 20 tokens');
        };
        this.sendAirdropDetails = (chatId, airdropName, steps, cost) => {
            const detailsMessage = `${airdropName}:\n\n Steps: ${steps}\nCost: ${cost}`;
            this.sendMessageToUser(chatId, detailsMessage);
        };
        this.sendPotentialAirdrops = (chatId) => {
            const message = 'List of potential airdrops:\n1. Airdrop A\n2. Airdrop B\n3. Airdrop C';
            this.sendMessageToUser(chatId, message);
            this.sendAirdropDetails(chatId, '🚀 Airdrop A 🚀', 'Step 7, Step 8', 'Cost: 25 tokens');
            this.sendAirdropDetails(chatId, '🚀 Airdrop B 🚀', 'Step 9, Step 10', 'Cost: 30 tokens');
            this.sendAirdropDetails(chatId, '🚀 Airdrop C 🚀', 'Step 11, Step 12', 'Cost: 35 tokens');
        };
        this.sendLatestAirdrops = (chatId) => {
            const message = 'List of latest airdrops:\n1. Airdrop X\n2. Airdrop Y\n3. Airdrop Z';
            this.sendMessageToUser(chatId, message);
            this.sendAirdropDetails(chatId, '🚀 Airdrop X 🚀', 'Step 13, Step 14', 'Cost: 40 tokens');
            this.sendAirdropDetails(chatId, '🚀 Airdrop Y 🚀', 'Step 15, Step 16', 'Cost: 45 tokens');
            this.sendAirdropDetails(chatId, '🚀 Airdrop Z 🚀', 'Step 17, Step 18', 'Cost: 50 tokens');
        };
        this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
        this.bot.on('message', this.onReceiveMessage);
    }
};
exports.BotService = BotService;
exports.BotService = BotService = BotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BotService);
//# sourceMappingURL=bot.service.js.map