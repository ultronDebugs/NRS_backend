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
exports.ApiKeyAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../../database");
const bcrypt = require("bcryptjs");
let ApiKeyAuthGuard = class ApiKeyAuthGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers["x-client-key"];
        const apiSecret = request.headers["x-client-secret"];
        if (!apiKey || !apiSecret) {
            throw new common_1.UnauthorizedException("Missing client API credentials");
        }
        const cred = await this.prisma.clientApiCredential.findFirst({
            where: { apiKey, isActive: true },
            include: { user: true },
        });
        if (!cred) {
            throw new common_1.UnauthorizedException("Invalid client API credentials");
        }
        const secretValid = await bcrypt.compare(apiSecret, cred.apiSecret);
        if (!secretValid) {
            throw new common_1.UnauthorizedException("Invalid client API credentials");
        }
        if (cred.user.role !== "CLIENT") {
            throw new common_1.ForbiddenException("Only clients may access this resource");
        }
        request.user = { id: cred.userId };
        return true;
    }
};
exports.ApiKeyAuthGuard = ApiKeyAuthGuard;
exports.ApiKeyAuthGuard = ApiKeyAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService])
], ApiKeyAuthGuard);
//# sourceMappingURL=api-key-auth.guard.js.map