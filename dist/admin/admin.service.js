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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let AdminService = class AdminService {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async createAirdrop(createAirdropDto) {
        return await this.databaseService.airDrops.create({
            data: createAirdropDto,
        });
    }
    async update(id, updateAirdropDto) {
        return await this.databaseService.airDrops.update({
            where: { id },
            data: updateAirdropDto,
        });
    }
    async delete(id) {
        return this.databaseService.airDrops.delete({ where: { id } });
    }
    async findAll(category) {
        if (category)
            return await this.databaseService.airDrops.findMany({
                where: { category },
            });
        return await this.databaseService.airDrops.findMany();
    }
    async getSubUserCount() {
        return await this.databaseService.user.count({
            where: { subscribed: true },
        });
    }
    async getAllUsers() {
        return await this.databaseService.user.count();
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AdminService);
//# sourceMappingURL=admin.service.js.map