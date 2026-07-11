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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenants_service_1 = require("./tenants.service");
const api_key_auth_guard_1 = require("./security/api-key-auth.guard");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
const throttler_1 = require("@nestjs/throttler");
const dtos_1 = require("./dtos");
const decorators_1 = require("../../common/decorators");
let TenantsController = class TenantsController {
    tenantsService;
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async validateInvoice(payload, req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyValidateInvoice(userId, payload);
        return result.data ?? { ok: true };
    }
    async signInvoice(payload, req) {
        const userId = req.id;
        const result = await this.tenantsService.proxySignInvoice(userId, payload);
        return result.data ?? { ok: true };
    }
    async confirmInvoice(irn, req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyConfirmInvoice(userId, irn);
        return result.data;
    }
    async transmitSelfHealthCheck(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyTransmitSelfHealthCheck(userId);
        return result.data;
    }
    async transmitLookupTin(tin, req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyTransmitLookupTin(userId, tin);
        return result.data;
    }
    async transmitLookupIrn(irn, req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyTransmitLookupIrn(userId, irn);
        return result.data;
    }
    async transmitPullInvoice(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyTransmitPullInvoice(userId);
        return result.data;
    }
    async transmitInvoice(irn, req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyTransmitInvoice(userId, irn);
        return result.data;
    }
    async transmitConfirmReceipt(irn, req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyTransmitConfirmReceipt(userId, irn);
        return result.data;
    }
    async validateIrn(payload, req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyValidateIrn(userId, payload);
        return result.data ?? { ok: true };
    }
    async getTaxCategories(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetTaxCategories(userId);
        return result.data;
    }
    async getPaymentMeans(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetPaymentMeans(userId);
        return result.data;
    }
    async getCountries(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetCountries(userId);
        return result.data;
    }
    async getCurrencies(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetCurrencies(userId);
        return result.data;
    }
    async getInvoiceTypes(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetInvoiceTypes(userId);
        return result.data;
    }
    async getServiceCodes(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetServiceCodes(userId);
        return result.data;
    }
    async getVatExemptions(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetVatExemptions(userId);
        return result.data;
    }
    async getHsCodes(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetHsCodes(userId);
        return result.data;
    }
    async getLgas(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetLgas(userId);
        return result.data;
    }
    async getStates(req) {
        const userId = req.id;
        const result = await this.tenantsService.proxyGetStates(userId);
        return result.data;
    }
    async createOrRotateKeys(req) {
        const userId = req.id;
        const keys = await this.tenantsService.createOrRotateKeys(userId);
        return keys;
    }
    async getKeys(req) {
        const userId = req.id;
        const keys = await this.tenantsService.getKeys(userId);
        return keys;
    }
    async getLogs(page = "1", limit = "10", req) {
        const userId = req.id;
        const result = await this.tenantsService.getLogs(userId, Number(page) || 1, Number(limit) || 10);
        return result;
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Post)("invoice/validate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.ValidateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "validateInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Post)("invoice/sign"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.ValidateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "signInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/confirm/:irn"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("irn")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "confirmInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/transmit/self-health-check"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "transmitSelfHealthCheck", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/transmit/lookup/tin/:tin"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("tin")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "transmitLookupTin", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/transmit/lookup/:irn"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("irn")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "transmitLookupIrn", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/transmit/pull"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "transmitPullInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Post)("invoice/transmit/:irn"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("irn")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "transmitInvoice", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Patch)("invoice/transmit/:irn"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)("irn")),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "transmitConfirmReceipt", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Post)("invoice/irn/validate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.ValidateIrnDto, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "validateIrn", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/tax-categories"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getTaxCategories", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/payment-means"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getPaymentMeans", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/countries"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getCountries", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/currencies"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getCurrencies", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/invoice-types"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getInvoiceTypes", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/service-codes"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getServiceCodes", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/vat-exemptions"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getVatExemptions", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/hs-codes"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getHsCodes", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/lgas"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getLgas", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', required: true, description: 'Tenant API Key' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-secret', required: true, description: 'Tenant API Secret' }),
    (0, common_1.Get)("invoice/resources/states"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getStates", null);
__decorate([
    (0, common_1.Post)("keys"),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "createOrRotateKeys", null);
__decorate([
    (0, common_1.Get)("keys"),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getKeys", null);
__decorate([
    (0, common_1.Get)("logs"),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getLogs", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)("Tenants"),
    (0, common_1.Controller)("api/v1/tenants"),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60000 } }),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map