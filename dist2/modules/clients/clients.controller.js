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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clients_service_1 = require("./clients.service");
const api_key_auth_guard_1 = require("./security/api-key-auth.guard");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
const throttler_1 = require("@nestjs/throttler");
const dtos_1 = require("./dtos");
const decorators_1 = require("../../common/decorators");
let ClientsController = class ClientsController {
    clientsService;
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    async validateInvoice(payload, req) {
        const userId = req.id;
        const result = await this.clientsService.proxyValidateInvoice(userId, payload);
        return result.data ?? { ok: true };
    }
    async signInvoice(payload, req) {
        const userId = req.id;
        const result = await this.clientsService.proxySignInvoice(userId, payload);
        return result.data ?? { ok: true };
    }
    async confirmInvoice(irn, req) {
        const userId = req.id;
        const result = await this.clientsService.proxyConfirmInvoice(userId, irn);
        return result.data;
    }
    async transmitSelfHealthCheck(req) {
        const userId = req.id;
        const result = await this.clientsService.proxyTransmitSelfHealthCheck(userId);
        return result.data;
    }
    async transmitLookupTin(tin, req) {
        const userId = req.id;
        const result = await this.clientsService.proxyTransmitLookupTin(userId, tin);
        return result.data;
    }
    async transmitLookupIrn(irn, req) {
        const userId = req.id;
        const result = await this.clientsService.proxyTransmitLookupIrn(userId, irn);
        return result.data;
    }
    async transmitPullInvoice(req) {
        const userId = req.id;
        const result = await this.clientsService.proxyTransmitPullInvoice(userId);
        return result.data;
    }
    async transmitInvoice(irn, req) {
        const userId = req.id;
        const result = await this.clientsService.proxyTransmitInvoice(userId, irn);
        return result.data;
    }
    async transmitConfirmReceipt(irn, req) {
        const userId = req.id;
        const result = await this.clientsService.proxyTransmitConfirmReceipt(userId, irn);
        return result.data;
    }
    async validateIrn(payload, req) {
        const userId = req.id;
        const result = await this.clientsService.proxyValidateIrn(userId, payload);
        return result.data ?? { ok: true };
    }
    async createOrRotateKeys(req) {
        const userId = req.id;
        const keys = await this.clientsService.createOrRotateKeys(userId);
        return keys;
    }
    async getKeys(req) {
        const userId = req.id;
        const keys = await this.clientsService.getKeys(userId);
        return keys;
    }
    async getLogs(page = "1", limit = "10", req) {
        const userId = req.id;
        const result = await this.clientsService.getLogs(userId, Number(page) || 1, Number(limit) || 10);
        return result;
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)("invoice/validate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.ValidateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "validateInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)("invoice/sign"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.ValidateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "signInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)("invoice/confirm/:irn"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("irn")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "confirmInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)("invoice/transmit/self-health-check"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "transmitSelfHealthCheck", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)("invoice/transmit/lookup/tin/:tin"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("tin")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "transmitLookupTin", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)("invoice/transmit/lookup/:irn"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("irn")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "transmitLookupIrn", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)("invoice/transmit/pull"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "transmitPullInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)("invoice/transmit/:irn"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("irn")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "transmitInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Patch)("invoice/transmit/:irn"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("irn")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "transmitConfirmReceipt", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)("invoice/irn/validate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.ValidateIrnDto, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "validateIrn", null);
__decorate([
    (0, common_1.Post)("keys"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "createOrRotateKeys", null);
__decorate([
    (0, common_1.Get)("keys"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getKeys", null);
__decorate([
    (0, common_1.Get)("logs"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getLogs", null);
exports.ClientsController = ClientsController = __decorate([
    (0, swagger_1.ApiTags)("Clients"),
    (0, common_1.Controller)("api/v1/clients"),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60000 } }),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map