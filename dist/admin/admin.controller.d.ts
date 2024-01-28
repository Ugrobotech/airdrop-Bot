/// <reference types="node-telegram-bot-api" />
import { AdminService } from './admin.service';
import { BotService } from 'src/bot/bot.service';
import { Prisma } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    private readonly botService;
    constructor(adminService: AdminService, botService: BotService);
    createAirdrop(createAirdropDto: Prisma.AirDropsCreateInput): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
        imageUrl: string;
    }>;
    updateAirdrop(id: string, updateAirdropDto: Prisma.AirDropsUpdateInput): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
        imageUrl: string;
    }>;
    delete(id: string): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
        imageUrl: string;
    }>;
    findAll(category?: 'LATEST' | 'HOTTEST' | 'POTENTIAL'): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
        imageUrl: string;
    }[]>;
    notifyAll(id: string, wishlist?: 'wishlist'): Promise<Promise<import("node-telegram-bot-api").Message>[]>;
    getAllUsers(): Promise<number>;
    getAllSubUsers(): Promise<number>;
}
