import * as TelegramBot from 'node-telegram-bot-api';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
export declare class BotService {
    private readonly databaseService;
    private readonly bot;
    private logger;
    constructor(databaseService: DatabaseService);
    onReceiveMessage: (msg: any) => Promise<void>;
    saveToDB(saveUserDto: Prisma.UserCreateInput): Promise<{
        id: number;
        username: string;
        first_name: string;
        chat_id: number;
        subscribed: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(username: string, updateUserDto: Prisma.UserUpdateInput): Promise<{
        id: number;
        username: string;
        first_name: string;
        chat_id: number;
        subscribed: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    fetchAirdrops(category: 'LATEST' | 'HOTTEST' | 'POTENTIAL'): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
    }[]>;
    sendPictureToUser: (userId: string, imageUrl: string) => Promise<TelegramBot.Message>;
    sendMessageToUser: (userId: string, message: string) => Promise<TelegramBot.Message>;
    sendToAllUsers: (userIds: string[], message: string) => Promise<Promise<TelegramBot.Message>[]>;
    sendMainMenu: (chatId: string) => Promise<TelegramBot.Message>;
    handleAirdropCommands: (msg: any) => Promise<TelegramBot.Message>;
    sendAirdropDetails: (chatId: string, airdropName: string, network?: string, details?: string, category?: string, steps?: string, cost?: string) => Promise<TelegramBot.Message>;
    sendHottestAirdrops: (chatId: string) => Promise<Promise<TelegramBot.Message>[]>;
    sendPotentialAirdrops: (chatId: string) => Promise<Promise<TelegramBot.Message>[]>;
    sendLatestAirdrops: (chatId: string) => Promise<Promise<TelegramBot.Message>[]>;
}
