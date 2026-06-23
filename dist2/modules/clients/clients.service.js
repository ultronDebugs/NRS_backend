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
var ClientsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../database");
const invoice_service_1 = require("../invoice/invoice.service");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
let ClientsService = ClientsService_1 = class ClientsService {
    prisma;
    invoiceService;
    logger = new common_1.Logger(ClientsService_1.name);
    constructor(prisma, invoiceService) {
        this.prisma = prisma;
        this.invoiceService = invoiceService;
    }
    async createOrRotateKeys(userId) {
        await this.ensureClient(userId);
        const apiKey = this.generateToken();
        const rawSecret = this.generateToken();
        const hashedSecret = await bcrypt.hash(rawSecret, 10);
        const existing = await this.prisma.clientApiCredential.findUnique({
            where: { userId },
        });
        if (existing) {
            await this.prisma.clientApiCredential.update({
                where: { userId },
                data: { apiKey, apiSecret: hashedSecret, isActive: true },
            });
        }
        else {
            await this.prisma.clientApiCredential.create({
                data: { userId, apiKey, apiSecret: hashedSecret },
            });
        }
        return { apiKey, apiSecret: rawSecret };
    }
    async getKeys(userId) {
        await this.ensureClient(userId);
        const cred = await this.prisma.clientApiCredential.findUnique({
            where: { userId },
        });
        if (!cred)
            return null;
        const maskedSecret = "****" + cred.apiSecret.slice(-4);
        return { apiKey: cred.apiKey, apiSecretMasked: maskedSecret };
    }
    async proxyValidateInvoice(userId, payload) {
        const endpoint = "/api/v1/invoice/validate";
        try {
            this.logger.log(`Client validate invoice request`);
            const result = await this.invoiceService.validateInvoice(payload);
            await this.saveLog(userId, "POST", endpoint, payload, 200, result);
            this.logger.log(`Client validate invoice success`);
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error(`Client validate invoice failed`, error.stack);
            await this.saveLog(userId, "POST", endpoint, payload, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Failed to validate invoice");
        }
    }
    async proxySignInvoice(userId, payload) {
        const endpoint = "/api/v1/invoice/sign";
        try {
            this.logger.log(`Client sign invoice request`);
            const result = await this.invoiceService.signInvoice(payload);
            await this.saveLog(userId, "POST", endpoint, payload, 200, result);
            this.logger.log(`Client sign invoice success`);
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error(`Client sign invoice failed`, error.stack);
            await this.saveLog(userId, "POST", endpoint, payload, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Failed to sign invoice");
        }
    }
    async proxyConfirmInvoice(userId, irn) {
        await this.verifyIrnOwnership(userId, irn);
        const endpoint = `/api/v1/invoice/confirm/${irn}`;
        try {
            this.logger.log(`Client confirm invoice request for IRN: ${irn}`);
            const result = await this.invoiceService.getInvoiceConfirmation(irn);
            await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
            this.logger.log(`Client confirm invoice success for IRN: ${irn}`);
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error(`Client confirm invoice failed for IRN: ${irn}`, error.stack);
            await this.saveLog(userId, "GET", endpoint, undefined, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Failed to confirm invoice");
        }
    }
    async proxyValidateIrn(userId, payload) {
        const endpoint = "/api/v1/invoice/irn/validate";
        try {
            this.logger.log(`Client validate IRN request`);
            const result = await this.invoiceService.validateIrn(payload);
            await this.saveLog(userId, "POST", endpoint, payload, 200, result);
            this.logger.log(`Client validate IRN success`);
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error(`Client validate IRN failed`, error.stack);
            await this.saveLog(userId, "POST", endpoint, payload, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Failed to validate IRN");
        }
    }
    async proxyTransmitSelfHealthCheck(userId) {
        const endpoint = "/api/v1/invoice/transmit/self-health-check";
        try {
            this.logger.log("Client transmit self health check request");
            const result = await this.invoiceService.transmitSelfHealthCheck();
            await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
            this.logger.log("Client transmit self health check success");
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error("Client transmit self health check failed", error.stack);
            await this.saveLog(userId, "GET", endpoint, undefined, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Transmit self health check failed");
        }
    }
    async proxyTransmitLookupIrn(userId, irn) {
        await this.verifyIrnOwnership(userId, irn);
        const endpoint = `/api/v1/invoice/transmit/lookup/${irn}`;
        try {
            this.logger.log(`Client transmit lookup IRN request: ${irn}`);
            const result = await this.invoiceService.transmitLookupIrn(irn);
            await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
            this.logger.log(`Client transmit lookup IRN success: ${irn}`);
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error(`Client transmit lookup IRN failed: ${irn}`, error.stack);
            await this.saveLog(userId, "GET", endpoint, undefined, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Failed to lookup IRN");
        }
    }
    async proxyTransmitLookupTin(userId, tin) {
        const endpoint = `/api/v1/invoice/transmit/lookup/tin/${tin}`;
        try {
            this.logger.log(`Client transmit lookup TIN request: ${tin}`);
            const result = await this.invoiceService.transmitLookupTin(tin);
            await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
            this.logger.log(`Client transmit lookup TIN success: ${tin}`);
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error(`Client transmit lookup TIN failed: ${tin}`, error.stack);
            await this.saveLog(userId, "GET", endpoint, undefined, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Failed to lookup TIN");
        }
    }
    async proxyTransmitInvoice(userId, irn) {
        await this.verifyIrnOwnership(userId, irn);
        const endpoint = `/api/v1/invoice/transmit/${irn}`;
        try {
            this.logger.log(`Client transmit invoice request: ${irn}`);
            const result = await this.invoiceService.transmitInvoice(irn);
            await this.saveLog(userId, "POST", endpoint, undefined, 200, result);
            this.logger.log(`Client transmit invoice success: ${irn}`);
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error(`Client transmit invoice failed: ${irn}`, error.stack);
            const responseStatus = error instanceof common_1.HttpException ? error.getStatus() : 500;
            await this.saveLog(userId, "POST", endpoint, undefined, responseStatus, {
                message: error.message,
            });
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.BadGatewayException("Failed to transmit invoice");
        }
    }
    async proxyTransmitConfirmReceipt(userId, irn) {
        await this.verifyIrnOwnership(userId, irn);
        const endpoint = `/api/v1/invoice/transmit/${irn}`;
        try {
            this.logger.log(`Client transmit confirm receipt request: ${irn}`);
            const result = await this.invoiceService.transmitConfirmReceipt(irn);
            await this.saveLog(userId, "PATCH", endpoint, undefined, 200, result);
            this.logger.log(`Client transmit confirm receipt success: ${irn}`);
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error(`Client transmit confirm receipt failed: ${irn}`, error.stack);
            await this.saveLog(userId, "PATCH", endpoint, undefined, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Failed to confirm receipt");
        }
    }
    async proxyTransmitPullInvoice(userId) {
        const endpoint = "/api/v1/invoice/transmit/pull";
        try {
            this.logger.log("Client transmit pull invoice request");
            const result = await this.invoiceService.transmitPullInvoice(userId);
            await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
            this.logger.log("Client transmit pull invoice success");
            return { ok: true, data: result };
        }
        catch (error) {
            this.logger.error("Client transmit pull invoice failed", error.stack);
            await this.saveLog(userId, "GET", endpoint, undefined, 500, {
                message: error.message,
            });
            throw new common_1.BadGatewayException("Failed to pull invoices");
        }
    }
    async getLogs(userId, page = 1, limit = 10) {
        await this.ensureClient(userId);
        limit = Math.min(Math.max(limit, 1), 100);
        page = Math.max(page, 1);
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.clientApiLog.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            this.prisma.clientApiLog.count({ where: { userId } }),
        ]);
        return { logs, total, page, limit };
    }
    async saveLog(userId, method, endpoint, requestBody, responseStatus, responseBody) {
        await this.prisma.clientApiLog.create({
            data: {
                userId,
                method,
                endpoint,
                requestBody: requestBody ? JSON.stringify(requestBody) : null,
                responseStatus,
                responseBody: responseBody ? JSON.stringify(responseBody) : null,
            },
        });
    }
    async ensureClient(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== "CLIENT") {
            throw new common_1.ForbiddenException("Only clients may access this resource");
        }
    }
    async verifyIrnOwnership(userId, irn) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { irn, userId },
            select: { id: true },
        });
        if (!invoice) {
            throw new common_1.ForbiddenException("You do not have permission to access this invoice");
        }
    }
    generateToken(length = 48) {
        return crypto.randomBytes(length).toString("base64url").slice(0, length);
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = ClientsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService,
        invoice_service_1.InvoiceService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map