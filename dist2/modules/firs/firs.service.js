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
var FirsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../database");
const axios_1 = require("axios");
let FirsService = FirsService_1 = class FirsService {
    prisma;
    logger = new common_1.Logger(FirsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    firsApiUrl = process.env.FIRS_API_URL ?? "";
    firsApiKey = process.env.FIRS_API_KEY ?? "";
    firsApiSecret = process.env.FIRS_API_SECRET ?? "";
    siApiKey = process.env.SYSTEM_INTEGRATOR_API_KEY ?? "";
    siApiSecret = process.env.SYSTEM_INTEGRATOR_API_SECRET ?? "";
    async loginTaxpayer(loginDto) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/utilities/authenticate`;
        const payload = {
            email: loginDto.email,
            password: loginDto.password,
        };
        try {
            const response = await axios_1.default.post(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.HttpException(error.response.data, error.response.status);
            }
            throw new common_1.BadGatewayException(`Failed to authenticate taxpayer: ${error.message}`);
        }
    }
    async getEntityById(entityId) {
        if (!this.firsApiUrl || !this.siApiKey || !this.siApiSecret) {
            throw new common_1.InternalServerErrorException("SI API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/entity/${entityId}`;
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.siApiKey,
                    "x-api-secret": this.siApiSecret,
                },
            });
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.HttpException(error.response.data, error.response.status);
            }
            throw new common_1.BadGatewayException(`Failed to fetch entity: ${error.message}`);
        }
    }
    async searchEntitiesByReference(searchParams) {
        if (!this.firsApiUrl || !this.siApiKey || !this.siApiSecret) {
            throw new common_1.InternalServerErrorException("SI API credentials are not set in environment variables");
        }
        const { size = 20, page = 1, sortBy = "created_at", sortDirectionDesc = true, } = searchParams ?? {};
        const url = `${this.firsApiUrl}/api/v1/entity`;
        const params = {
            size,
            page,
            sort_by: sortBy,
            sort_direction_desc: sortDirectionDesc,
            reference: searchParams.reference,
        };
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.siApiKey,
                    "x-api-secret": this.siApiSecret,
                },
                params,
            });
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.HttpException(error.response.data, error.response.status);
            }
            throw new common_1.BadGatewayException(`Failed to search entities: ${error.message}`);
        }
    }
    async getCountries() {
        if (!this.firsApiUrl) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/resources/countries`;
        try {
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to get countries: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to get countries: ${error.message}`);
        }
    }
    async getCurrencies() {
        if (!this.firsApiUrl) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/resources/currencies`;
        try {
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to get currencies: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to get currencies: ${error.message}`);
        }
    }
    async getTaxCategories() {
        if (!this.firsApiUrl) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/resources/tax-categories`;
        try {
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to get tax categories: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to get tax categories: ${error.message}`);
        }
    }
    async getPaymentMeans() {
        if (!this.firsApiUrl) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/resources/payment-means`;
        try {
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to get payment means: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to get payment means: ${error.message}`);
        }
    }
    async getInvoiceTypes() {
        if (!this.firsApiUrl) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/resources/invoice-types`;
        try {
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to get invoice types: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to get invoice types: ${error.message}`);
        }
    }
    async getServiceCodes() {
        if (!this.firsApiUrl) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/resources/services-codes`;
        try {
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to get service codes: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to get service codes: ${error.message}`);
        }
    }
    async getVatExemptions() {
        if (!this.firsApiUrl) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/resources/vat-exemptions`;
        try {
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to get VAT exemptions: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to get VAT exemptions: ${error.message}`);
        }
    }
    async validateIrn(params) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/irn/validate`;
        const body = {
            invoice_reference: params.invoiceReference,
            business_id: params.businessId,
            irn: params.irn,
        };
        try {
            const response = await axios_1.default.post(url, body, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            if (response.data &&
                response.data.data &&
                typeof response.data.data.ok === "boolean") {
                return { ok: response.data.data.ok };
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to validate IRN: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to validate IRN: ${error.message}`);
        }
    }
    async validateInvoice(params) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/validate`;
        try {
            const response = await axios_1.default.post(url, params, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            if (response.data &&
                response.data.data &&
                typeof response.data.data.ok === "boolean") {
                return { ok: response.data.data.ok };
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to validate invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to validate invoice: ${error.message}`);
        }
    }
    async signInvoice(params) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/sign`;
        try {
            const response = await axios_1.default.post(url, params, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            if (response.data &&
                response.data.data &&
                typeof response.data.data.ok === "boolean") {
                return { ok: response.data.data.ok };
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to sign invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to sign invoice: ${error.message}`);
        }
    }
    async getDecryptedInvoice(params) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        if (!params.irn) {
            throw new common_1.BadGatewayException("IRN is required to download the invoice");
        }
        if (!params.decryptionKey) {
            throw new common_1.BadGatewayException("Decryption key is required to decrypt the invoice");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/download/${params.irn}`;
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            if (response.data &&
                response.data.data &&
                typeof response.data.data.iv_hex === "string" &&
                typeof response.data.data.data === "string") {
                const ivHex = response.data.data.iv_hex;
                const ciphertext = response.data.data.data;
                const key = Buffer.from(params.decryptionKey, "base64");
                let iv;
                try {
                    iv = Buffer.from(ivHex, "hex");
                }
                catch (err) {
                    throw new common_1.InternalServerErrorException("Error decoding IV: " + err.message);
                }
                try {
                    const decrypted = this.decryptAes256Cfb(key, iv, ciphertext);
                    return decrypted;
                }
                catch (err) {
                    throw new common_1.InternalServerErrorException("Decryption error: " + err.message);
                }
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to download invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to download invoice: ${error.message}`);
        }
    }
    decryptAes256Cfb(key, iv, ciphertext) {
        const ciphertextBytes = Buffer.from(ciphertext, "base64url");
        const crypto = require("crypto");
        const decipher = crypto.createDecipheriv("aes-256-cfb", key, iv);
        const decrypted = Buffer.concat([
            decipher.update(ciphertextBytes),
            decipher.final(),
        ]);
        return decrypted.toString("utf8");
    }
    async getInvoiceConfirmation(irn) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/confirm/${irn}`;
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            if (response.data &&
                response.data.data &&
                typeof response.data.data.issue_date === "string" &&
                typeof response.data.data.due_date === "string" &&
                typeof response.data.data.sync_date === "string" &&
                typeof response.data.data.payment_status === "string" &&
                typeof response.data.data.transmitted === "boolean" &&
                typeof response.data.data.delivered === "boolean") {
                return {
                    issueDate: response.data.data.issue_date,
                    dueDate: response.data.data.due_date,
                    syncDate: response.data.data.sync_date,
                    paymentStatus: response.data.data.payment_status,
                    transmitted: response.data.data.transmitted,
                    delivered: response.data.data.delivered,
                };
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to confirm invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to confirm invoice: ${error.message}`);
        }
    }
    async updateInvoicePaymentStatus(params) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/update/${params.irn}`;
        const body = {
            payment_status: params.paymentStatus,
        };
        if (params.reference) {
            body.reference = params.reference;
        }
        try {
            const response = await axios_1.default.patch(url, body, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            if (response.data &&
                response.data.code === 200 &&
                response.data.data &&
                typeof response.data.data.ok === "boolean") {
                return { ok: response.data.data.ok };
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to update invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to update invoice: ${error.message}`);
        }
    }
    async handleWebhookNotification(payload) {
        this.logger.log(`Received webhook notification for IRN: ${payload.irn} with status: ${payload.message}`);
        try {
            await this.logWebhookEvent(payload);
            await this.processWebhookByStatus(payload);
            const response = {
                success: true,
                message: "Webhook processed successfully",
                timestamp: new Date().toISOString(),
            };
            this.logger.log(`Successfully processed webhook for IRN: ${payload.irn}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to process webhook for IRN: ${payload.irn}`, error.stack);
            await this.logFailedWebhook(payload, error.message);
            throw error;
        }
    }
    async logWebhookEvent(payload) {
        try {
            await this.prisma.webhookEvent.create({
                data: {
                    irn: payload.irn,
                    status: payload.message,
                    receivedAt: new Date(),
                    processed: true,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log webhook event for IRN: ${payload.irn}`, error.stack);
        }
    }
    async logFailedWebhook(payload, errorMessage) {
        try {
            await this.prisma.webhookEvent.create({
                data: {
                    irn: payload.irn,
                    status: payload.message,
                    receivedAt: new Date(),
                    processed: false,
                    errorMessage,
                    retryCount: 0,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log failed webhook for IRN: ${payload.irn}`, error.stack);
        }
    }
    async processWebhookByStatus(payload) {
        switch (payload.message) {
            case "TRANSMITTING":
                await this.handleTransmittingStatus(payload.irn);
                break;
            case "TRANSMITTED":
                await this.handleTransmittedStatus(payload.irn);
                break;
            case "ACKNOWLEDGED":
                await this.handleAcknowledgedStatus(payload.irn);
                break;
            case "FAILED":
                await this.handleFailedStatus(payload.irn);
                break;
            default:
                this.logger.warn(`Unknown webhook status: ${payload.message} for IRN: ${payload.irn}`);
        }
    }
    async handleTransmittingStatus(irn) {
        this.logger.log(`Invoice ${irn} is being transmitted`);
        try {
            await this.prisma.invoice.updateMany({
                where: { irn },
                data: {
                    status: "TRANSMITTING",
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update invoice status for IRN: ${irn}`, error.stack);
        }
    }
    async handleTransmittedStatus(irn) {
        this.logger.log(`Invoice ${irn} has been transmitted successfully`);
        try {
            await this.prisma.invoice.updateMany({
                where: { irn },
                data: {
                    status: "TRANSMITTED",
                    transmittedAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update invoice status for IRN: ${irn}`, error.stack);
        }
    }
    async handleAcknowledgedStatus(irn) {
        this.logger.log(`Invoice ${irn} has been acknowledged`);
        try {
            await this.prisma.invoice.updateMany({
                where: { irn },
                data: {
                    status: "ACKNOWLEDGED",
                    acknowledgedAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update invoice status for IRN: ${irn}`, error.stack);
        }
    }
    async handleFailedStatus(irn) {
        this.logger.error(`Invoice ${irn} transmission failed`);
        try {
            await this.prisma.invoice.updateMany({
                where: { irn },
                data: {
                    status: "FAILED",
                    failedAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update invoice status for IRN: ${irn}`, error.stack);
        }
    }
    async processFailedWebhooks() {
        this.logger.log("Processing failed webhooks for retry");
        try {
            const failedWebhooks = await this.prisma.webhookEvent.findMany({
                where: {
                    processed: false,
                    retryCount: { lt: 3 },
                },
                orderBy: { receivedAt: "asc" },
                take: 100,
            });
            for (const webhook of failedWebhooks) {
                try {
                    const payload = {
                        irn: webhook.irn,
                        message: webhook.status,
                    };
                    await this.handleWebhookNotification(payload);
                    await this.prisma.webhookEvent.update({
                        where: { id: webhook.id },
                        data: { processed: true },
                    });
                }
                catch (error) {
                    await this.prisma.webhookEvent.update({
                        where: { id: webhook.id },
                        data: {
                            retryCount: { increment: 1 },
                            errorMessage: error.message,
                        },
                    });
                    this.logger.error(`Retry failed for webhook ID: ${webhook.id}`, error.stack);
                }
            }
        }
        catch (error) {
            this.logger.error("Failed to process failed webhooks", error.stack);
        }
    }
};
exports.FirsService = FirsService;
exports.FirsService = FirsService = FirsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService])
], FirsService);
//# sourceMappingURL=firs.service.js.map