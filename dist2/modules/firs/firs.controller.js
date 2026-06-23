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
var FirsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const firs_service_1 = require("./firs.service");
const dtos_1 = require("./dtos");
const decorators_1 = require("../../common/decorators");
let FirsController = FirsController_1 = class FirsController {
    firsService;
    logger = new common_1.Logger(FirsController_1.name);
    constructor(firsService) {
        this.firsService = firsService;
    }
    async authenticateTaxpayer(payload) {
        this.logger.log(`Authenticating taxpayer with FIRS: ${payload.email}`);
        return this.firsService.loginTaxpayer(payload);
    }
    async searchEntities(query) {
        this.logger.log("Searching FIRS entities");
        return this.firsService.searchEntitiesByReference(query);
    }
    async getEntity(entityId) {
        this.logger.log(`Fetching FIRS entity: ${entityId}`);
        return this.firsService.getEntityById(entityId);
    }
    async handleWebhook(payload) {
        this.logger.log(`Received webhook request for IRN: ${payload.irn}`);
        try {
            const response = await this.firsService.handleWebhookNotification(payload);
            this.logger.log(`Webhook processed successfully for IRN: ${payload.irn}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to process webhook for IRN: ${payload.irn}`, error.stack);
            throw error;
        }
    }
    async retryFailedWebhooks() {
        this.logger.log("Manual retry of failed webhooks triggered");
        try {
            await this.firsService.processFailedWebhooks();
            return { message: "Failed webhooks processing completed" };
        }
        catch (error) {
            this.logger.error("Failed to process failed webhooks", error.stack);
            throw error;
        }
    }
};
exports.FirsController = FirsController;
__decorate([
    (0, common_1.Post)("taxpayer/authenticate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Authenticate FIRS taxpayer",
        description: "Calls FIRS /api/v1/utilities/authenticate with the configured API key/secret and taxpayer email/password. FIRS returns the taxpayer entity_id when the credentials are valid.",
    }),
    (0, swagger_1.ApiBody)({ type: dtos_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "FIRS taxpayer authentication response",
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Missing or invalid local JWT" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "FIRS authentication failed" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.LoginDto]),
    __metadata("design:returntype", Promise)
], FirsController.prototype, "authenticateTaxpayer", null);
__decorate([
    (0, common_1.Get)("entities"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Search FIRS entities",
        description: "Searches entities visible to the configured FIRS API key/secret. Use reference when FIRS provides one during APP/SI onboarding.",
    }),
    (0, swagger_1.ApiQuery)({ name: "reference", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: "size", required: false, type: Number, example: 20 }),
    (0, swagger_1.ApiQuery)({
        name: "sortBy",
        required: false,
        type: String,
        example: "created_at",
    }),
    (0, swagger_1.ApiQuery)({
        name: "sortDirectionDesc",
        required: false,
        type: Boolean,
        example: true,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "FIRS entity search response" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Missing or invalid local JWT" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "FIRS entity search failed" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.SearchEntityDto]),
    __metadata("design:returntype", Promise)
], FirsController.prototype, "searchEntities", null);
__decorate([
    (0, common_1.Get)("entities/:entityId"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Get FIRS entity by ID",
        description: "Fetches a FIRS entity by entity_id using the configured API key/secret.",
    }),
    (0, swagger_1.ApiParam)({
        name: "entityId",
        description: "FIRS entity_id",
        example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "FIRS entity response" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Missing or invalid local JWT" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "FIRS entity fetch failed" }),
    __param(0, (0, common_1.Param)("entityId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FirsController.prototype, "getEntity", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)("webhook"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.WebhookPayloadDto]),
    __metadata("design:returntype", Promise)
], FirsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)("webhook/retry-failed"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FirsController.prototype, "retryFailedWebhooks", null);
exports.FirsController = FirsController = FirsController_1 = __decorate([
    (0, swagger_1.ApiTags)("FIRS"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("api/v1/firs"),
    __metadata("design:paramtypes", [firs_service_1.FirsService])
], FirsController);
//# sourceMappingURL=firs.controller.js.map