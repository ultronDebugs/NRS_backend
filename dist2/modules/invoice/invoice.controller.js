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
var InvoiceController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoice_service_1 = require("./invoice.service");
const dtos_1 = require("./dtos");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
const decorators_1 = require("../../common/decorators");
let InvoiceController = InvoiceController_1 = class InvoiceController {
    invoiceService;
    logger = new common_1.Logger(InvoiceController_1.name);
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
    }
    async ensureInvoiceOwnership(invoiceId, user) {
        if (user.role === "ADMIN")
            return;
        const invoice = await this.invoiceService.getInvoiceById(invoiceId);
        if (!invoice || invoice.userId !== user.id) {
            throw new common_1.UnauthorizedException("You do not have permission to access this invoice");
        }
    }
    async getEntityById(user, params) {
        this.logger.log(`Received request to get entity with ID: ${params.entityId}`);
        if (user.entityId !== params.entityId && user.role !== "ADMIN") {
            throw new common_1.UnauthorizedException("You do not have permission to view this entity data");
        }
        try {
            const entity = await this.invoiceService.getEntityById(params.entityId);
            this.logger.log(`Successfully retrieved entity with ID: ${params.entityId}`);
            return entity;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve entity with ID: ${params.entityId}`, error.stack);
            throw error;
        }
    }
    async transmitSelfHealthCheck() {
        this.logger.log("Received transmit self health check request");
        try {
            const result = await this.invoiceService.transmitSelfHealthCheck();
            this.logger.log("Transmit self health check completed");
            return result;
        }
        catch (error) {
            this.logger.error("Transmit self health check failed", error.stack);
            throw error;
        }
    }
    async transmitLookupTin(tin) {
        this.logger.log(`Received transmit lookup TIN request: ${tin}`);
        try {
            const result = await this.invoiceService.transmitLookupTin(tin);
            this.logger.log(`Transmit lookup TIN completed: ${tin}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transmit lookup TIN failed: ${tin}`, error.stack);
            throw error;
        }
    }
    async transmitPullInvoice() {
        this.logger.log("Received transmit pull invoice request");
        try {
            const result = await this.invoiceService.transmitPullInvoice();
            this.logger.log("Transmit pull invoice completed");
            return result;
        }
        catch (error) {
            this.logger.error("Transmit pull invoice failed", error.stack);
            throw error;
        }
    }
    async transmitLookupById(user, invoiceId) {
        this.logger.log(`Received transmit lookup request for invoice ID: ${invoiceId}`);
        await this.ensureInvoiceOwnership(invoiceId, user);
        try {
            const result = await this.invoiceService.transmitLookupIrnById(invoiceId);
            this.logger.log(`Transmit lookup completed for invoice ID: ${invoiceId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transmit lookup failed for invoice ID: ${invoiceId}`, error.stack);
            throw error;
        }
    }
    async transmitInvoiceById(user, invoiceId) {
        this.logger.log(`Received transmit invoice request for ID: ${invoiceId}`);
        await this.ensureInvoiceOwnership(invoiceId, user);
        try {
            const result = await this.invoiceService.transmitInvoiceById(invoiceId);
            this.logger.log(`Transmit invoice completed for ID: ${invoiceId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transmit invoice failed for ID: ${invoiceId}`, error.stack);
            throw error;
        }
    }
    async retryTransmitInvoiceById(user, invoiceId) {
        this.logger.log(`Received transmit retry request for ID: ${invoiceId}`);
        await this.ensureInvoiceOwnership(invoiceId, user);
        try {
            const result = await this.invoiceService.retryTransmitInvoiceById(invoiceId);
            this.logger.log(`Transmit retry completed for ID: ${invoiceId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transmit retry failed for ID: ${invoiceId}`, error.stack);
            throw error;
        }
    }
    async transmitConfirmReceiptById(user, invoiceId) {
        this.logger.log(`Received transmit confirm receipt request for ID: ${invoiceId}`);
        await this.ensureInvoiceOwnership(invoiceId, user);
        try {
            const result = await this.invoiceService.transmitConfirmReceiptById(invoiceId);
            this.logger.log(`Transmit confirm receipt completed for ID: ${invoiceId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transmit confirm receipt failed for ID: ${invoiceId}`, error.stack);
            throw error;
        }
    }
    async createInvoice(user, payload) {
        this.logger.log(`Received invoice creation request for IRN: ${payload.irn}`);
        try {
            const invoice = await this.invoiceService.createInvoice(payload, user.id);
            this.logger.log(`Successfully created invoice with IRN: ${payload.irn} and ID: ${invoice.id}`);
            return invoice;
        }
        catch (error) {
            this.logger.error(`Failed to create invoice with IRN: ${payload.irn}`, error.stack);
            throw error;
        }
    }
    async getMyInvoices(user, page = 1, limit = 10) {
        this.logger.log(`Received request to get invoices for authenticated user ID: ${user.id}, page: ${page}, limit: ${limit}`);
        try {
            const result = await this.invoiceService.getInvoicesByUserId(user.id, page, limit);
            this.logger.log(`Successfully retrieved ${result.invoices.length} invoices for user ID: ${user.id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve invoices for user ID: ${user.id}`, error.stack);
            throw error;
        }
    }
    async getInvoiceById(user, invoiceId) {
        this.logger.log(`Received request to get invoice with ID: ${invoiceId}`);
        await this.ensureInvoiceOwnership(invoiceId, user);
        try {
            const invoice = await this.invoiceService.getInvoiceById(invoiceId);
            this.logger.log(`Successfully retrieved invoice with ID: ${invoiceId}`);
            return invoice;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve invoice with ID: ${invoiceId}`, error.stack);
            throw error;
        }
    }
    async signInvoiceById(user, invoiceId) {
        this.logger.log(`Received request to sign invoice with ID: ${invoiceId}`);
        await this.ensureInvoiceOwnership(invoiceId, user);
        try {
            const result = await this.invoiceService.signInvoiceById(invoiceId);
            this.logger.log(`Successfully signed invoice with ID: ${invoiceId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to sign invoice with ID: ${invoiceId}`, error.stack);
            throw error;
        }
    }
    async confirmInvoiceById(user, invoiceId) {
        this.logger.log(`Received request to confirm invoice with ID: ${invoiceId}`);
        await this.ensureInvoiceOwnership(invoiceId, user);
        try {
            const result = await this.invoiceService.confirmInvoiceById(invoiceId);
            this.logger.log(`Successfully confirmed invoice with ID: ${invoiceId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to confirm invoice with ID: ${invoiceId}`, error.stack);
            throw error;
        }
    }
    async updateInvoiceById(invoiceId, payload) {
        this.logger.log(`Received request to update invoice with ID: ${invoiceId}`);
        try {
            const updatedInvoice = await this.invoiceService.updateInvoiceById(invoiceId, payload);
            this.logger.log(`Successfully updated invoice with ID: ${invoiceId}`);
            return updatedInvoice;
        }
        catch (error) {
            this.logger.error(`Failed to update invoice with ID: ${invoiceId}`, error.stack);
            throw error;
        }
    }
};
exports.InvoiceController = InvoiceController;
__decorate([
    (0, common_1.Get)("entity/:entityId"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Get entity by ID",
        description: "Retrieves entity information by entity ID from the FIRS API",
    }),
    (0, swagger_1.ApiParam)({
        name: "entityId",
        description: "The unique identifier of the entity",
        example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Entity information retrieved successfully",
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Invalid entity ID provided",
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Entity not found",
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Internal server error",
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dtos_1.GetEntityDto]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getEntityById", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)("transmit/self-health-check"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Transmit self health check",
        description: "Confirms setup and readiness for transmission. Sends test notification to validate connection and API key.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Health check result" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "transmitSelfHealthCheck", null);
__decorate([
    (0, common_1.Get)("transmit/lookup/tin/:tin"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Transmit lookup TIN",
        description: "Retrieves invoice and involved parties details by TIN",
    }),
    (0, swagger_1.ApiParam)({ name: "tin", description: "Tax Identification Number" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "TIN lookup result" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Not found" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("tin")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "transmitLookupTin", null);
__decorate([
    (0, common_1.Get)("transmit/pull"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Transmit pull invoice",
        description: "Retrieves invoices in transit. Updates local invoice status to TRANSMITTING.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Pull result with invoices" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "transmitPullInvoice", null);
__decorate([
    (0, common_1.Get)(":id/transmit/lookup"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Transmit lookup by invoice ID",
        description: "Retrieves invoice and involved parties details by invoice ID",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Invoice ID", example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Invoice lookup result" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Invoice not found" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "transmitLookupById", null);
__decorate([
    (0, common_1.Post)(":id/transmit"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Transmit invoice by ID",
        description: "Sends webhook notification to all involved parties about invoice transmission.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Invoice ID", example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Transmit result" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Invoice not found" }),
    (0, swagger_1.ApiResponse)({
        status: 503,
        description: "Transmission temporarily unavailable; retry later",
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "transmitInvoiceById", null);
__decorate([
    (0, common_1.Post)(":id/transmit/retry"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Retry transmit invoice by ID",
        description: "Retries invoice transmission after a retryable upstream failure such as offline access points.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Invoice ID", example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Transmit retry result" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Invoice not found" }),
    (0, swagger_1.ApiResponse)({
        status: 503,
        description: "Transmission temporarily unavailable; retry later",
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "retryTransmitInvoiceById", null);
__decorate([
    (0, common_1.Patch)(":id/transmit/confirm"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Transmit confirm receipt by invoice ID",
        description: "Acknowledges receipt of transmitted invoice. Invoice is completely transmitted when all parties acknowledge.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Invoice ID", example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Confirm receipt result" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Invoice not found" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "transmitConfirmReceiptById", null);
__decorate([
    (0, common_1.Post)("create"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Create Invoice",
        description: "Validates invoice with FIRS API and creates a new invoice in the database",
    }),
    (0, swagger_1.ApiBody)({
        type: dtos_1.CreateInvoiceDto,
        description: "The invoice data to create",
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "Invoice created successfully",
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Invalid payload provided or invoice validation failed",
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: "Invoice with this IRN already exists",
    }),
    (0, swagger_1.ApiResponse)({
        status: 422,
        description: "Invoice validation failed - invoice data is invalid according to FIRS API",
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Internal server error or FIRS API error",
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dtos_1.CreateInvoiceDto]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)("my-invoices"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Get authenticated user invoices with pagination",
        description: "Gets all invoices for the authenticated user with pagination",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "User invoices retrieved successfully",
        schema: {
            type: "object",
            properties: {
                invoices: {
                    type: "array",
                    description: "Array of invoices",
                },
                total: {
                    type: "number",
                    description: "Total number of invoices",
                },
                page: {
                    type: "number",
                    description: "Current page number",
                },
                limit: {
                    type: "number",
                    description: "Number of invoices per page",
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Invalid pagination parameters",
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: "Unauthorized - Invalid or missing JWT token",
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Internal server error",
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("page", new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)("limit", new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getMyInvoices", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Get invoice by ID",
        description: "Gets a single invoice by ID with all related data",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "The invoice ID to retrieve",
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Invoice retrieved successfully",
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Invalid invoice ID provided",
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Invoice not found",
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Internal server error",
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getInvoiceById", null);
__decorate([
    (0, common_1.Post)(":id/sign"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Sign invoice by ID",
        description: "Signs an invoice by ID using the FIRS API and updates its status to SIGNED",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "The invoice ID to sign",
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Invoice signed successfully",
        schema: {
            type: "object",
            properties: {
                ok: {
                    type: "boolean",
                    description: "Whether the invoice signing was successful",
                },
                invoice: {
                    type: "object",
                    description: "The updated invoice",
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Invalid invoice ID provided",
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Invoice not found",
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Internal server error",
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "signInvoiceById", null);
__decorate([
    (0, common_1.Post)(":id/confirm"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Confirm invoice by ID",
        description: "Confirms an invoice by ID using the FIRS API and updates its status to CONFIRMED",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "The invoice ID to confirm",
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Invoice confirmed successfully",
        schema: {
            type: "object",
            properties: {
                ok: {
                    type: "boolean",
                    description: "Whether the invoice confirmation was successful",
                },
                invoice: {
                    type: "object",
                    description: "The updated invoice",
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Invalid invoice ID provided",
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Invoice not found",
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Internal server error",
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "confirmInvoiceById", null);
__decorate([
    (0, common_1.Post)(":id/update"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: "Update invoice by ID",
        description: "Updates an invoice by ID and calls FIRS API to update the invoice",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "The invoice ID to update",
        example: 1,
    }),
    (0, swagger_1.ApiBody)({
        type: dtos_1.UpdateInvoiceDto,
        description: "The invoice data to update",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Invoice updated successfully",
        schema: {
            type: "object",
            properties: {
                id: {
                    type: "number",
                    description: "The updated invoice ID",
                },
                irn: {
                    type: "string",
                    description: "The invoice reference number",
                },
                status: {
                    type: "string",
                    description: "The invoice status",
                },
                updatedAt: {
                    type: "string",
                    format: "date-time",
                    description: "The update timestamp",
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Invalid invoice ID or payload provided",
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Invoice not found",
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: "Invoice cannot be updated due to current status",
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Internal server error or FIRS API error",
    }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dtos_1.UpdateInvoiceDto]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "updateInvoiceById", null);
exports.InvoiceController = InvoiceController = InvoiceController_1 = __decorate([
    (0, swagger_1.ApiTags)("Invoice"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("api/v1/invoice"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [invoice_service_1.InvoiceService])
], InvoiceController);
//# sourceMappingURL=invoice.controller.js.map