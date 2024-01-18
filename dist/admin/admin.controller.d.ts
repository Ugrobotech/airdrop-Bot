import { AdminService } from './admin.service';
import { Prisma } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createAirdrop(createAirdropDto: Prisma.AirDropsCreateInput): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
    }>;
    updateAirdrop(id: string, updateAirdropDto: Prisma.AirDropsUpdateInput): Promise<{
        id: number;
        name: string;
        network: string;
        description: string;
        category: import(".prisma/client").$Enums.Category;
        steps: string;
        cost: string;
    }>;
    delete(id: string): Promise<{
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
    getAllUsers(): Promise<number>;
    getAllSubUsers(): Promise<number>;
}
