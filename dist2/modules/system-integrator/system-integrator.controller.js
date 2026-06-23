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
var SystemIntegratorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemIntegratorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const system_integrator_service_1 = require("./system-integrator.service");
const validete_invoice_dto_1 = require("../firs/dtos/validete-invoice.dto");
const dtos_1 = require("./dtos");
let SystemIntegratorController = SystemIntegratorController_1 = class SystemIntegratorController {
    systemIntegratorService;
    logger = new common_1.Logger(SystemIntegratorController_1.name);
    constructor(systemIntegratorService) {
        this.systemIntegratorService = systemIntegratorService;
    }
    async validateInvoice(params) {
        this.logger.log(`Received validate invoice request for IRN: ${params.irn}`);
        try {
            const result = await this.systemIntegratorService.validateInvoice(params);
            this.logger.log(`Invoice validation completed for IRN: ${params.irn}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to validate invoice with IRN: ${params.irn}`, error.stack);
            throw error;
        }
    }
    async generateQrCode(params) {
        this.logger.log(`Received generate QR code request for IRN: ${params.irn}`);
        try {
            const result = await this.systemIntegratorService.generateQrCode(params);
            this.logger.log(`QR code generation completed for IRN: ${params.irn}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to generate QR code for IRN: ${params.irn}`, error.stack);
            throw error;
        }
    }
    async getFirsSettings(userId) {
        this.logger.log(`Received get FIRS settings request for user: ${userId}`);
        try {
            const result = await this.systemIntegratorService.getFirsSettings(userId);
            this.logger.log(`FIRS settings retrieved for user: ${userId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to get FIRS settings for user: ${userId}`, error.stack);
            throw error;
        }
    }
    async updateFirsSettings(params) {
        this.logger.log(`Received update FIRS settings request for user: ${params.userId}`);
        try {
            const result = await this.systemIntegratorService.updateFirsSettings(params);
            this.logger.log(`FIRS settings updated for user: ${params.userId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to update FIRS settings for user: ${params.userId}`, error.stack);
            throw error;
        }
    }
    async test() {
        this.logger.log("System Integrator test endpoint called");
        return {
            message: "System Integrator module is working",
            timestamp: new Date().toISOString(),
        };
    }
};
exports.SystemIntegratorController = SystemIntegratorController;
__decorate([
    (0, common_1.Post)("validate-invoice"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Validate invoice",
        description: "Validates an invoice using the FIRS API. Same implementation as invoice module.",
    }),
    (0, swagger_1.ApiBody)({ type: validete_invoice_dto_1.FirsValidateInvoiceDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Invoice validation result",
        schema: {
            type: "object",
            properties: {
                ok: { type: "boolean" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Unauthorized" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validete_invoice_dto_1.FirsValidateInvoiceDto]),
    __metadata("design:returntype", Promise)
], SystemIntegratorController.prototype, "validateInvoice", null);
__decorate([
    (0, common_1.Post)("qr-code"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Generate QR code",
        description: "Generates FIRS QR code encrypted payload (same as invoice module). Supports passing firsPublicKeyBase64 and firsCertificateBase64 in payload, or userId for stored settings, or env vars.",
    }),
    (0, swagger_1.ApiBody)({ type: dtos_1.GenerateQrCodeDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "QR code generation result",
        schema: {
            type: "object",
            properties: {
                qrCode: { type: "string" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Unauthorized" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.GenerateQrCodeDto]),
    __metadata("design:returntype", Promise)
], SystemIntegratorController.prototype, "generateQrCode", null);
__decorate([
    (0, common_1.Get)("firs-settings/:userId"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Get FIRS settings for a user",
        description: "Retrieves stored FIRS_PUBLIC_KEY_BASE64 and FIRS_CERTIFICATE_BASE64 for the given user",
    }),
    (0, swagger_1.ApiParam)({ name: "userId", description: "User ID", example: 1 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "FIRS settings retrieved successfully",
        schema: {
            type: "object",
            properties: {
                firsPublicKeyBase64: { type: "string", nullable: true },
                firsCertificateBase64: { type: "string", nullable: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Settings not found for user" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("userId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SystemIntegratorController.prototype, "getFirsSettings", null);
__decorate([
    (0, common_1.Put)("firs-settings"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Set FIRS settings for a user",
        description: "Stores FIRS_PUBLIC_KEY_BASE64 and FIRS_CERTIFICATE_BASE64 for the given user",
    }),
    (0, swagger_1.ApiBody)({ type: dtos_1.UpdateFirsSettingsDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "FIRS settings updated successfully",
        schema: {
            type: "object",
            properties: {
                userId: { type: "number" },
                firsPublicKeyBase64: { type: "string", nullable: true },
                firsCertificateBase64: { type: "string", nullable: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.UpdateFirsSettingsDto]),
    __metadata("design:returntype", Promise)
], SystemIntegratorController.prototype, "updateFirsSettings", null);
__decorate([
    (0, common_1.Post)("test"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: "Test endpoint for System Integrator module" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Test successful",
        schema: {
            type: "object",
            properties: {
                message: { type: "string" },
                timestamp: { type: "string" },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemIntegratorController.prototype, "test", null);
exports.SystemIntegratorController = SystemIntegratorController = SystemIntegratorController_1 = __decorate([
    (0, swagger_1.ApiTags)("System Integrator"),
    (0, common_1.Controller)("api/v1/system-integrator"),
    __metadata("design:paramtypes", [system_integrator_service_1.SystemIntegratorService])
], SystemIntegratorController);
//# sourceMappingURL=system-integrator.controller.js.map