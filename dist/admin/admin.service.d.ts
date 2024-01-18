import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
export declare class AdminService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    createAirdrop(createAirdropDto: Prisma.AirDropsCreateInput): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
    }>;
    update(id: number, updateAirdropDto: Prisma.AirDropsUpdateInput): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
    }>;
    delete(id: number): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
    }>;
    findAll(category?: 'LATEST' | 'HOTTEST' | 'POTENTIAL'): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
    }[]>;
    getSubUserCount(): Promise<number>;
    getAllUsers(): Promise<number>;
}
