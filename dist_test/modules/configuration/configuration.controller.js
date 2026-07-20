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
exports.ConfigurationController = void 0;
const common_1 = require("@nestjs/common");
const configuration_service_1 = require("./configuration.service");
const swagger_1 = require("@nestjs/swagger");
const decorators_1 = require("../../common/decorators");
let ConfigurationController = class ConfigurationController {
    configurationService;
    constructor(configurationService) {
        this.configurationService = configurationService;
    }
    async getInvoiceTypes() {
        return this.configurationService.getInvoiceTypes();
    }
    async getPaymentMeans() {
        return this.configurationService.getPaymentMeans();
    }
    async getTaxCategories() {
        return this.configurationService.getTaxCategories();
    }
    async getCurrencies() {
        return this.configurationService.getCurrencies();
    }
    async getVatExemptions() {
        return this.configurationService.getVatExemptions();
    }
    async getProductCodes() {
        return this.configurationService.getProductCodes();
    }
    async getServiceCodes() {
        return this.configurationService.getServiceCodes();
    }
    async getLocalGovernments() {
        return this.configurationService.getLocalGovernments();
    }
    async getStateCodes() {
        return this.configurationService.getStateCodes();
    }
    async smokeTest() {
        return {
            message: "Configuration service is working",
            timestamp: new Date().toISOString(),
        };
    }
};
exports.ConfigurationController = ConfigurationController;
__decorate([
    (0, common_1.Get)("invoice-types"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all invoice types" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of invoice types retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getInvoiceTypes", null);
__decorate([
    (0, common_1.Get)("payment_means"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all payment means" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of payment means retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getPaymentMeans", null);
__decorate([
    (0, common_1.Get)("tax-categories"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all tax categories" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of tax categories retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getTaxCategories", null);
__decorate([
    (0, common_1.Get)("currencies"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all currencies" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of currencies retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getCurrencies", null);
__decorate([
    (0, common_1.Get)("vat-exemptions"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all VAT exemptions" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of VAT exemptions retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getVatExemptions", null);
__decorate([
    (0, common_1.Get)("hs-codes"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all product codes (HS codes)" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of product codes retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getProductCodes", null);
__decorate([
    (0, common_1.Get)("services-codes"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all service codes" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of service codes retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getServiceCodes", null);
__decorate([
    (0, common_1.Get)("lgas"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all local government areas" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of local government areas retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getLocalGovernments", null);
__decorate([
    (0, common_1.Get)("states"),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all state codes" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of state codes retrieved successfully",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getStateCodes", null);
__decorate([
    (0, common_1.Get)("admin/test"),
    (0, swagger_1.ApiOperation)({ summary: "Smoke test endpoint" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Configuration service is working" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "smokeTest", null);
exports.ConfigurationController = ConfigurationController = __decorate([
    (0, swagger_1.ApiTags)("Configuration"),
    (0, common_1.Controller)("api/v1/invoice/resources"),
    __metadata("design:paramtypes", [configuration_service_1.ConfigurationService])
], ConfigurationController);
//# sourceMappingURL=configuration.controller.js.map