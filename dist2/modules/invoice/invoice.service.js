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
var InvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../database");
const axios_1 = require("axios");
const firs_qr_code_helper_1 = require("../../shared/helpers/firs-qr-code.helper");
const crypto_util_1 = require("../../shared/helpers/crypto.util");
let InvoiceService = InvoiceService_1 = class InvoiceService {
    prisma;
    logger = new common_1.Logger(InvoiceService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    firsApiUrl = process.env.FIRS_API_URL ?? "";
    firsApiKey = process.env.FIRS_API_KEY ?? "";
    firsApiSecret = process.env.FIRS_API_SECRET ?? "";
    async getFirsHeadersForBusiness(businessId) {
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
        });
        if (!business?.firsApiKey || !business?.firsApiSecret) {
            throw new common_1.BadRequestException("Business FIRS API credentials not configured. Please update FIRS settings.");
        }
        return {
            "Content-Type": "application/json",
            "x-api-key": (0, crypto_util_1.decryptCredential)(business.firsApiKey),
            "x-api-secret": (0, crypto_util_1.decryptCredential)(business.firsApiSecret),
        };
    }
    buildFirsHeaders() {
        return {
            "Content-Type": "application/json",
            "x-api-key": this.firsApiKey,
            "x-api-secret": this.firsApiSecret,
        };
    }
    parseTransmitError(error) {
        const responseData = error?.response?.data;
        const upstreamError = responseData?.error ?? {};
        const publicMessage = upstreamError.public_message ??
            upstreamError.details ??
            responseData?.message ??
            error?.message ??
            "Transmission failed";
        const details = upstreamError.details ?? publicMessage;
        const searchableText = JSON.stringify(responseData ?? error?.message ?? "")
            .toLowerCase();
        const accessPointsOffline = searchableText.includes("access points are offline") ||
            searchableText.includes("corresponding access points are offline");
        return {
            statusCode: error?.response?.status,
            responseBody: responseData,
            code: responseData?.code,
            message: responseData?.message,
            publicMessage,
            details,
            errorId: upstreamError.id,
            handler: upstreamError.handler,
            retryable: accessPointsOffline,
        };
    }
    createTransmitException(irn, context, invoice) {
        const response = {
            message: context.retryable
                ? `Invoice transmission is temporarily unavailable: ${context.publicMessage}`
                : `Transmit invoice failed: ${context.publicMessage}`,
            error: context.retryable ? "Transmission Temporarily Unavailable" : "Bad Gateway",
            retryable: context.retryable,
            invoice: invoice
                ? {
                    id: invoice.id,
                    irn,
                    status: invoice.status,
                }
                : {
                    irn,
                },
            upstream: {
                statusCode: context.statusCode,
                code: context.code,
                message: context.message,
                publicMessage: context.publicMessage,
                details: context.details,
                errorId: context.errorId,
                handler: context.handler,
            },
        };
        return context.retryable
            ? new common_1.ServiceUnavailableException(response)
            : new common_1.BadGatewayException(response);
    }
    async sendTransmitInvoiceRequest(irn, businessId) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/transmit/${encodeURIComponent(irn)}`;
        const response = await axios_1.default.post(url, {}, {
            headers: this.buildFirsHeaders(),
        });
        return response.data;
    }
    async updateInvoiceTransmissionFailure(invoiceId, retryable) {
        const status = retryable
            ? "TRANSMISSION_PENDING_RETRY"
            : "TRANSMISSION_FAILED";
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status,
                failedAt: new Date(),
            },
        });
        return status;
    }
    async getEntityById(entityId) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/entity/${entityId}`;
        try {
            this.logger.log(`Fetching entity with ID: ${entityId}`);
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            this.logger.log(`Successfully fetched entity with ID: ${entityId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch entity with ID: ${entityId}`, error.stack);
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to fetch entity: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to fetch entity: ${error.message}`);
        }
    }
    async validateIrn(params) {
        const url = `${this.firsApiUrl}/api/v1/invoice/irn/validate`;
        const body = {
            invoice_reference: params.invoice_reference,
            business_id: params.business_id,
            irn: params.irn,
        };
        try {
            this.logger.log(`Validating IRN: ${params.irn} for invoice: ${params.invoice_reference}`);
            const response = await axios_1.default.post(url, body, {
                headers: await this.getFirsHeadersForBusiness(params.business_id),
            });
            this.logger.log(`Successfully validated IRN: ${params.irn}`);
            if (response.data &&
                response.data.data &&
                typeof response.data.data.ok === "boolean") {
                return { ok: response.data.data.ok };
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            this.logger.error(`Failed to validate IRN: ${params.irn}`, error.stack);
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
            this.logger.log(`Validating invoice with IRN: ${params.irn}`);
            const response = await axios_1.default.post(url, params, {
                headers: await this.getFirsHeadersForBusiness(params.business_id),
            });
            this.logger.log(`Successfully validated invoice with IRN: ${params.irn}`);
            if (response.data &&
                response.data.data &&
                typeof response.data.data.ok === "boolean") {
                return { ok: response.data.data.ok };
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            this.logger.error(`Failed to validate invoice with IRN: ${params.irn}`, error.stack);
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
            this.logger.log(`Signing invoice with IRN: ${params.irn}`);
            const response = await axios_1.default.post(url, params, {
                headers: await this.getFirsHeadersForBusiness(params.business_id),
            });
            this.logger.log(`Successfully signed invoice with IRN: ${params.irn}`);
            if (response.data &&
                response.data.data &&
                typeof response.data.data.ok === "boolean") {
                return { ok: response.data.data.ok };
            }
            throw new common_1.BadGatewayException("Invalid response from FIRS API");
        }
        catch (error) {
            this.logger.error(`Failed to sign invoice with IRN: ${params.irn}`, error.stack);
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to sign invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to sign invoice: ${error.message}`);
        }
    }
    async transmitSelfHealthCheck() {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/transmit/self-health-check`;
        try {
            this.logger.log("Running transmit self health check");
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            this.logger.log("Transmit self health check successful");
            return response.data;
        }
        catch (error) {
            this.logger.error("Transmit self health check failed", error.stack);
            if (error.response) {
                throw new common_1.BadGatewayException(`Transmit self health check failed: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Transmit self health check failed: ${error.message}`);
        }
    }
    async transmitLookupIrn(irn) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/transmit/lookup/${encodeURIComponent(irn)}`;
        try {
            this.logger.log(`Transmit lookup IRN: ${irn}`);
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            this.logger.log(`Transmit lookup IRN successful: ${irn}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Transmit lookup IRN failed: ${irn}`, error.stack);
            if (error.response) {
                throw new common_1.BadGatewayException(`Transmit lookup IRN failed: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Transmit lookup IRN failed: ${error.message}`);
        }
    }
    async transmitLookupTin(tin) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/transmit/lookup/tin/${encodeURIComponent(tin)}`;
        try {
            this.logger.log(`Transmit lookup TIN: ${tin}`);
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            this.logger.log(`Transmit lookup TIN successful: ${tin}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Transmit lookup TIN failed: ${tin}`, error.stack);
            if (error.response) {
                throw new common_1.BadGatewayException(`Transmit lookup TIN failed: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Transmit lookup TIN failed: ${error.message}`);
        }
    }
    async transmitInvoice(irn) {
        try {
            this.logger.log(`Transmit invoice: ${irn}`);
            const invoiceRec = await this.prisma.invoice.findUnique({ where: { irn } });
            if (!invoiceRec)
                throw new common_1.NotFoundException("Invoice not found");
            const response = await this.sendTransmitInvoiceRequest(irn, invoiceRec.businessId);
            this.logger.log(`Transmit invoice successful: ${irn}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Transmit invoice failed: ${irn}`, error.stack);
            const context = this.parseTransmitError(error);
            throw this.createTransmitException(irn, context);
        }
    }
    async transmitConfirmReceipt(irn) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const invoiceRec = await this.prisma.invoice.findUnique({ where: { irn } });
        if (!invoiceRec)
            throw new common_1.NotFoundException("Invoice not found");
        const url = `${this.firsApiUrl}/api/v1/invoice/transmit/${encodeURIComponent(irn)}`;
        try {
            this.logger.log(`Transmit confirm receipt: ${irn}`);
            const response = await axios_1.default.patch(url, {}, {
                headers: await this.getFirsHeadersForBusiness(invoiceRec.businessId),
            });
            this.logger.log(`Transmit confirm receipt successful: ${irn}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Transmit confirm receipt failed: ${irn}`, error.stack);
            if (error.response) {
                throw new common_1.BadGatewayException(`Transmit confirm receipt failed: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Transmit confirm receipt failed: ${error.message}`);
        }
    }
    async transmitLookupIrnById(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            select: { irn: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        return this.transmitLookupIrn(invoice.irn);
    }
    async transmitInvoiceById(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            select: { id: true, irn: true, businessId: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        try {
            const result = await this.sendTransmitInvoiceRequest(invoice.irn, invoice.businessId);
            await this.prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: "TRANSMITTING",
                    failedAt: null,
                    updatedAt: new Date(),
                },
            });
            return result;
        }
        catch (error) {
            const context = this.parseTransmitError(error);
            let status = context.retryable
                ? "TRANSMISSION_PENDING_RETRY"
                : "TRANSMISSION_FAILED";
            try {
                status = await this.updateInvoiceTransmissionFailure(invoiceId, context.retryable);
            }
            catch (updateError) {
                this.logger.error(`Failed to update transmission failure status for invoice ID: ${invoiceId}`, updateError.stack);
            }
            throw this.createTransmitException(invoice.irn, context, {
                id: invoiceId,
                status,
            });
        }
    }
    async retryTransmitInvoiceById(invoiceId) {
        return this.transmitInvoiceById(invoiceId);
    }
    async transmitConfirmReceiptById(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            select: { irn: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        return this.transmitConfirmReceipt(invoice.irn);
    }
    async transmitPullInvoice(userId) {
        if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
            throw new common_1.InternalServerErrorException("FIRS API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/transmit/pull`;
        try {
            this.logger.log("Transmit pull invoice");
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            const data = response.data;
            if (data?.data?.invoices && Array.isArray(data.data.invoices)) {
                const irns = data.data.invoices
                    .map((inv) => inv.irn)
                    .filter(Boolean);
                if (irns.length > 0) {
                    const whereClause = { irn: { in: irns } };
                    if (userId) {
                        whereClause.userId = userId;
                    }
                    await this.prisma.invoice.updateMany({
                        where: whereClause,
                        data: { status: "TRANSMITTING", updatedAt: new Date() },
                    });
                    this.logger.log(`Updated invoices to TRANSMITTING for pulled IRNs`);
                }
            }
            this.logger.log("Transmit pull invoice successful");
            return response.data;
        }
        catch (error) {
            this.logger.error("Transmit pull invoice failed", error.stack);
            if (error.response) {
                throw new common_1.BadGatewayException(`Transmit pull invoice failed: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Transmit pull invoice failed: ${error.message}`);
        }
    }
    async getInvoiceConfirmation(irn) {
        const invoiceRec = await this.prisma.invoice.findUnique({ where: { irn } });
        if (!invoiceRec)
            throw new common_1.NotFoundException("Invoice not found");
        const url = `${this.firsApiUrl}/api/v1/invoice/confirm/${encodeURIComponent(irn)}`;
        try {
            this.logger.log(`Getting invoice confirmation for IRN: ${irn}`);
            const response = await axios_1.default.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            this.logger.log(`Successfully retrieved invoice confirmation for IRN: ${irn}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get invoice confirmation for IRN: ${irn}`, error.stack);
            if (error.response) {
                throw new common_1.BadGatewayException(`Failed to get invoice confirmation: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadGatewayException(`Failed to get invoice confirmation: ${error.message}`);
        }
    }
    async getInvoicesByUserId(userId, page = 1, limit = 10) {
        try {
            this.logger.log(`Getting invoices for user ID: ${userId}, page: ${page}, limit: ${limit}`);
            const skip = (page - 1) * limit;
            const [invoices, total] = await Promise.all([
                this.prisma.invoice.findMany({
                    where: { userId },
                    skip,
                    take: limit,
                    include: {
                        invoiceDeliveryPeriod: true,
                        accountingSupplierParty: {
                            include: {
                                postalAddress: true,
                            },
                        },
                        accountingCustomerParty: {
                            include: {
                                postalAddress: true,
                            },
                        },
                        billingReferences: true,
                        documentReferences: true,
                        dispatchDocumentReference: true,
                        receiptDocumentReference: true,
                        originatorDocumentReference: true,
                        contractDocumentReference: true,
                        paymentMeans: true,
                        allowanceCharges: true,
                        taxTotals: {
                            include: {
                                taxSubtotals: {
                                    include: {
                                        taxCategory: true,
                                    },
                                },
                            },
                        },
                        legalMonetaryTotal: true,
                        invoiceLines: {
                            include: {
                                item: true,
                                price: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
                this.prisma.invoice.count({
                    where: { userId },
                }),
            ]);
            this.logger.log(`Successfully retrieved ${invoices.length} invoices for user ID: ${userId}`);
            return {
                invoices,
                total,
                page,
                limit,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get invoices for user ID: ${userId}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to get invoices: ${error.message}`);
        }
    }
    async getInvoiceById(invoiceId) {
        try {
            this.logger.log(`Getting invoice with ID: ${invoiceId}`);
            const invoice = await this.prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: {
                    invoiceDeliveryPeriod: true,
                    accountingSupplierParty: {
                        include: {
                            postalAddress: true,
                        },
                    },
                    accountingCustomerParty: {
                        include: {
                            postalAddress: true,
                        },
                    },
                    billingReferences: true,
                    documentReferences: true,
                    dispatchDocumentReference: true,
                    receiptDocumentReference: true,
                    originatorDocumentReference: true,
                    contractDocumentReference: true,
                    paymentMeans: true,
                    allowanceCharges: true,
                    taxTotals: {
                        include: {
                            taxSubtotals: {
                                include: {
                                    taxCategory: true,
                                },
                            },
                        },
                    },
                    legalMonetaryTotal: true,
                    invoiceLines: {
                        include: {
                            item: true,
                            price: true,
                        },
                    },
                },
            });
            if (!invoice) {
                throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
            }
            let encryptedBase64;
            try {
                const irn_id = invoice.irn;
                const business = await this.prisma.business.findUnique({
                    where: { id: invoice.businessId }
                });
                encryptedBase64 = (0, firs_qr_code_helper_1.generateFirsQrCode)(irn_id, business?.firsPublicKeyBase64 ?? undefined, business?.firsCertificateBase64 ?? undefined);
                this.logger.log(`Successfully generated QR code for invoice with ID: ${invoiceId}`);
            }
            catch (qrError) {
                this.logger.warn(`Failed to generate QR code for invoice with ID: ${invoiceId}`, qrError.message);
            }
            this.logger.log(`Successfully retrieved invoice with ID: ${invoiceId}`);
            return {
                ...invoice,
                encryptedBase64,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get invoice with ID: ${invoiceId}`, error.stack);
            throw error instanceof common_1.NotFoundException ? error : new common_1.InternalServerErrorException(`Failed to get invoice: ${error.message}`);
        }
    }
    async signInvoiceById(invoiceId) {
        try {
            this.logger.log(`Signing invoice with ID: ${invoiceId}`);
            const invoice = await this.getInvoiceById(invoiceId);
            const invoiceDto = this.convertInvoiceToDto(invoice);
            const signResult = await this.signInvoice(invoiceDto);
            if (signResult.ok) {
                const updatedInvoice = await this.prisma.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        status: "SIGNED",
                        transmittedAt: new Date(),
                    },
                });
                this.logger.log(`Successfully signed invoice with ID: ${invoiceId}`);
                return { ok: true, invoice: updatedInvoice };
            }
            else {
                throw new common_1.BadGatewayException("Failed to sign invoice via FIRS API");
            }
        }
        catch (error) {
            this.logger.error(`Failed to sign invoice with ID: ${invoiceId}`, error.stack);
            throw error instanceof common_1.BadGatewayException || error instanceof common_1.NotFoundException ? error : new common_1.BadGatewayException(`Failed to sign invoice: ${error.message}`);
        }
    }
    async confirmInvoiceById(invoiceId) {
        try {
            this.logger.log(`Confirming invoice with ID: ${invoiceId}`);
            const invoice = await this.getInvoiceById(invoiceId);
            const confirmResult = await this.getInvoiceConfirmation(invoice.irn);
            if (confirmResult) {
                const updatedInvoice = await this.prisma.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        status: "CONFIRMED",
                        acknowledgedAt: new Date(),
                    },
                });
                this.logger.log(`Successfully confirmed invoice with ID: ${invoiceId}`);
                return { ok: true, invoice: updatedInvoice };
            }
            else {
                throw new common_1.BadGatewayException("Failed to confirm invoice via FIRS API");
            }
        }
        catch (error) {
            this.logger.error(`Failed to confirm invoice with ID: ${invoiceId}`, error.stack);
            throw error instanceof common_1.BadGatewayException || error instanceof common_1.NotFoundException ? error : new common_1.BadGatewayException(`Failed to confirm invoice: ${error.message}`);
        }
    }
    convertInvoiceToDto(invoice) {
        return {
            invoice_kind: invoice.invoiceKind || "B2B",
            business_id: invoice.businessId,
            irn: invoice.irn,
            issue_date: invoice.issueDate.toISOString().split("T")[0],
            due_date: invoice.dueDate
                ? invoice.dueDate.toISOString().split("T")[0]
                : undefined,
            issue_time: invoice.issueTime,
            invoice_type_code: invoice.invoiceTypeCode,
            payment_status: invoice.paymentStatus,
            note: invoice.note,
            tax_point_date: invoice.taxPointDate
                ? invoice.taxPointDate.toISOString().split("T")[0]
                : undefined,
            document_currency_code: invoice.documentCurrencyCode,
            tax_currency_code: invoice.taxCurrencyCode,
            accounting_cost: invoice.accountingCost,
            buyer_reference: invoice.buyerReference,
            order_reference: invoice.orderReference,
            actual_delivery_date: invoice.actualDeliveryDate
                ? invoice.actualDeliveryDate.toISOString().split("T")[0]
                : undefined,
            payment_terms_note: invoice.paymentTermsNote,
            invoice_delivery_period: invoice.invoiceDeliveryPeriod
                ? {
                    start_date: invoice.invoiceDeliveryPeriod.startDate
                        .toISOString()
                        .split("T")[0],
                    end_date: invoice.invoiceDeliveryPeriod.endDate
                        .toISOString()
                        .split("T")[0],
                }
                : undefined,
            accounting_supplier_party: {
                party_name: invoice.accountingSupplierParty.partyName,
                tin: invoice.accountingSupplierParty.tin,
                email: invoice.accountingSupplierParty.email,
                telephone: invoice.accountingSupplierParty.telephone,
                business_description: invoice.accountingSupplierParty.businessDescription,
                postal_address: {
                    street_name: invoice.accountingSupplierParty.postalAddress.streetName,
                    city_name: invoice.accountingSupplierParty.postalAddress.cityName,
                    postal_zone: invoice.accountingSupplierParty.postalAddress.postalZone,
                    country: invoice.accountingSupplierParty.postalAddress.country,
                    lga: invoice.accountingSupplierParty.postalAddress.lga,
                    state: invoice.accountingSupplierParty.postalAddress.state,
                },
            },
            accounting_customer_party: {
                party_name: invoice.accountingCustomerParty.partyName,
                tin: invoice.accountingCustomerParty.tin,
                email: invoice.accountingCustomerParty.email,
                telephone: invoice.accountingCustomerParty.telephone,
                business_description: invoice.accountingCustomerParty.businessDescription,
                postal_address: {
                    street_name: invoice.accountingCustomerParty.postalAddress.streetName,
                    city_name: invoice.accountingCustomerParty.postalAddress.cityName,
                    postal_zone: invoice.accountingCustomerParty.postalAddress.postalZone,
                    country: invoice.accountingCustomerParty.postalAddress.country,
                    lga: invoice.accountingCustomerParty.postalAddress.lga,
                    state: invoice.accountingCustomerParty.postalAddress.state,
                },
            },
            billing_reference: invoice.billingReferences?.map((ref) => ({
                irn: ref.irn,
                issue_date: ref.issueDate.toISOString().split("T")[0],
            })),
            _document_reference: invoice.documentReferences?.map((ref) => ({
                irn: ref.irn,
                issue_date: ref.issueDate.toISOString().split("T")[0],
            })),
            dispatch_document_reference: invoice.dispatchDocumentReference
                ? {
                    irn: invoice.dispatchDocumentReference.irn,
                    issue_date: invoice.dispatchDocumentReference.issueDate
                        .toISOString()
                        .split("T")[0],
                }
                : undefined,
            receipt_document_reference: invoice.receiptDocumentReference
                ? {
                    irn: invoice.receiptDocumentReference.irn,
                    issue_date: invoice.receiptDocumentReference.issueDate
                        .toISOString()
                        .split("T")[0],
                }
                : undefined,
            originator_document_reference: invoice.originatorDocumentReference
                ? {
                    irn: invoice.originatorDocumentReference.irn,
                    issue_date: invoice.originatorDocumentReference.issueDate
                        .toISOString()
                        .split("T")[0],
                }
                : undefined,
            contract_document_reference: invoice.contractDocumentReference
                ? {
                    irn: invoice.contractDocumentReference.irn,
                    issue_date: invoice.contractDocumentReference.issueDate
                        .toISOString()
                        .split("T")[0],
                }
                : undefined,
            payment_means: invoice.paymentMeans?.map((pm) => ({
                payment_means_code: pm.paymentMeansCode,
                payment_due_date: pm.paymentDueDate.toISOString().split("T")[0],
            })),
            allowance_charge: invoice.allowanceCharges?.map((ac) => ({
                charge_indicator: ac.chargeIndicator,
                amount: ac.amount,
            })),
            tax_total: invoice.taxTotals?.map((tt) => ({
                tax_amount: tt.taxAmount,
                tax_subtotal: tt.taxSubtotals?.map((ts) => ({
                    taxable_amount: ts.taxableAmount,
                    tax_amount: ts.taxAmount,
                    tax_category: {
                        id: ts.taxCategory?.categoryId,
                        percent: ts.taxCategory?.percent,
                    },
                })),
            })),
            legal_monetary_total: {
                line_extension_amount: invoice.legalMonetaryTotal.lineExtensionAmount,
                tax_exclusive_amount: invoice.legalMonetaryTotal.taxExclusiveAmount,
                tax_inclusive_amount: invoice.legalMonetaryTotal.taxInclusiveAmount,
                payable_amount: invoice.legalMonetaryTotal.payableAmount,
            },
            invoice_line: invoice.invoiceLines?.map((line) => ({
                hsn_code: line.hsnCode,
                product_category: line.productCategory,
                discount_rate: line.discountRate,
                discount_amount: line.discountAmount,
                fee_rate: line.feeRate,
                fee_amount: line.feeAmount,
                invoiced_quantity: line.invoicedQuantity,
                line_extension_amount: line.lineExtensionAmount,
                item: {
                    name: line.item.name,
                    description: line.item.description,
                    sellers_item_identification: line.item.sellersItemIdentification,
                },
                price: {
                    price_amount: line.price.priceAmount,
                    base_quantity: line.price.baseQuantity,
                    price_unit: line.price.priceUnit,
                },
            })),
        };
    }
    async createInvoice(data, userId) {
        try {
            this.logger.log(`Creating invoice with IRN: ${data.irn}`);
            const existingInvoice = await this.prisma.invoice.findUnique({
                where: { irn: data.irn },
            });
            if (existingInvoice) {
                throw new common_1.ConflictException(`Invoice with IRN ${data.irn} already exists`);
            }
            let businessId = data.business_id;
            if (!businessId) {
                const userWithEntity = await this.prisma.user.findUnique({
                    where: { id: userId },
                    include: { entity: { include: { businesses: true } } },
                });
                if (userWithEntity && userWithEntity.entity && userWithEntity.entity.businesses && userWithEntity.entity.businesses.length > 0) {
                    businessId = userWithEntity.entity.businesses[0].id;
                }
                else {
                    throw new common_1.BadRequestException("No business ID provided and no business found for user");
                }
            }
            let lineExtTotal = 0;
            let taxExclTotal = 0;
            let taxInclTotal = 0;
            let totalTaxAmount = 0;
            const taxSubtotalsMap = new Map();
            const invoiceLines = data.items.map((line) => {
                const lineExtensionAmount = line.quantity * line.unit_price;
                const taxRate = line.tax_rate ?? 7.5;
                const taxAmount = (lineExtensionAmount * taxRate) / 100;
                lineExtTotal += lineExtensionAmount;
                taxExclTotal += lineExtensionAmount;
                taxInclTotal += lineExtensionAmount + taxAmount;
                totalTaxAmount += taxAmount;
                const existingTax = taxSubtotalsMap.get(taxRate);
                if (existingTax) {
                    existingTax.taxableAmount += lineExtensionAmount;
                    existingTax.taxAmount += taxAmount;
                }
                else {
                    taxSubtotalsMap.set(taxRate, {
                        taxableAmount: lineExtensionAmount,
                        taxAmount: taxAmount,
                        categoryId: line.tax_category || "STANDARD_VAT",
                        percent: taxRate,
                    });
                }
                return {
                    hsnCode: line.hsn_code || line.isic_code || "N/A",
                    productCategory: line.product_category || line.service_category || "N/A",
                    discountRate: 0,
                    discountAmount: line.discount_amount || 0,
                    feeRate: 0,
                    feeAmount: line.fee_amount || 0,
                    invoicedQuantity: line.quantity,
                    lineExtensionAmount: lineExtensionAmount,
                    item: {
                        create: {
                            name: line.name,
                            description: line.description || "",
                        },
                    },
                    price: {
                        create: {
                            priceAmount: line.unit_price,
                            baseQuantity: 1,
                            priceUnit: line.price_unit || "C62",
                        },
                    },
                };
            });
            const invoice = await this.prisma.invoice.create({
                data: {
                    businessId: businessId,
                    userId: userId,
                    irn: data.irn,
                    issueDate: data.issue_date ? new Date(data.issue_date) : new Date(),
                    dueDate: data.due_date ? new Date(data.due_date) : null,
                    issueTime: data.issue_time,
                    invoiceTypeCode: data.invoice_type_code || "396",
                    invoiceKind: data.invoice_kind || "B2B",
                    paymentStatus: data.payment_status || "PENDING",
                    note: data.note,
                    documentCurrencyCode: data.document_currency_code || "NGN",
                    taxCurrencyCode: data.tax_currency_code || data.document_currency_code || "NGN",
                    accountingSupplierParty: data.supplier
                        ? {
                            create: {
                                partyName: data.supplier.party_name,
                                tin: data.supplier.tin,
                                email: data.supplier.email,
                                telephone: data.supplier.telephone,
                                businessDescription: data.supplier.business_description,
                                postalAddress: {
                                    create: {
                                        streetName: data.supplier.postal_address.street_name,
                                        cityName: data.supplier.postal_address.city_name,
                                        postalZone: data.supplier.postal_address.postal_zone,
                                        country: data.supplier.postal_address.country ?? "NG",
                                        lga: data.supplier.postal_address.lga,
                                        state: data.supplier.postal_address.state,
                                    },
                                },
                            },
                        }
                        : undefined,
                    accountingCustomerParty: {
                        create: {
                            partyName: data.customer.party_name,
                            tin: data.customer.tin,
                            email: data.customer.email,
                            telephone: data.customer.telephone,
                            businessDescription: data.customer.business_description,
                            postalAddress: {
                                create: {
                                    streetName: data.customer.postal_address.street_name,
                                    cityName: data.customer.postal_address.city_name,
                                    postalZone: data.customer.postal_address.postal_zone,
                                    country: data.customer.postal_address.country ?? "NG",
                                    lga: data.customer.postal_address.lga,
                                    state: data.customer.postal_address.state,
                                },
                            },
                        },
                    },
                    taxTotals: {
                        create: [
                            {
                                taxAmount: totalTaxAmount,
                                taxSubtotals: {
                                    create: Array.from(taxSubtotalsMap.values()).map((ts) => ({
                                        taxableAmount: ts.taxableAmount,
                                        taxAmount: ts.taxAmount,
                                        taxCategory: {
                                            create: {
                                                categoryId: ts.categoryId,
                                                percent: ts.percent,
                                            },
                                        },
                                    })),
                                },
                            },
                        ],
                    },
                    legalMonetaryTotal: {
                        create: {
                            lineExtensionAmount: lineExtTotal,
                            taxExclusiveAmount: taxExclTotal,
                            taxInclusiveAmount: taxInclTotal,
                            payableAmount: taxInclTotal,
                        },
                    },
                    invoiceLines: {
                        create: invoiceLines,
                    },
                },
                include: {
                    invoiceDeliveryPeriod: true,
                    accountingSupplierParty: {
                        include: {
                            postalAddress: true,
                        },
                    },
                    accountingCustomerParty: {
                        include: {
                            postalAddress: true,
                        },
                    },
                    billingReferences: true,
                    documentReferences: true,
                    dispatchDocumentReference: true,
                    receiptDocumentReference: true,
                    originatorDocumentReference: true,
                    contractDocumentReference: true,
                    paymentMeans: true,
                    allowanceCharges: true,
                    taxTotals: {
                        include: {
                            taxSubtotals: {
                                include: {
                                    taxCategory: true,
                                },
                            },
                        },
                    },
                    legalMonetaryTotal: true,
                    invoiceLines: {
                        include: {
                            item: true,
                            price: true,
                        },
                    },
                },
            });
            this.logger.log(`Successfully created invoice with IRN: ${data.irn} and ID: ${invoice.id}`);
            this.logger.log(`Invoice creation completed - validation passed and database record created`);
            return invoice;
        }
        catch (error) {
            this.logger.error(`Failed to create invoice with IRN: ${data.irn}`, error.stack);
            if (error.message.includes("already exists")) {
                throw new common_1.ConflictException(`Invoice with IRN ${data.irn} already exists`);
            }
            if (error.message.includes("validation failed")) {
                throw new common_1.BadRequestException(`Invoice validation failed: ${error.message}`);
            }
            throw error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException ? error : new common_1.InternalServerErrorException(`Failed to create invoice: ${error.message}`);
        }
    }
    async updateInvoiceById(invoiceId, updateData) {
        try {
            this.logger.log(`Updating invoice with ID: ${invoiceId}`);
            const existingInvoice = await this.getInvoiceById(invoiceId);
            if (!existingInvoice) {
                throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
            }
            if (existingInvoice.status !== "PENDING") {
                throw new common_1.BadRequestException(`Invoice with ID ${invoiceId} cannot be updated. Current status: ${existingInvoice.status}`);
            }
            const updatedInvoice = await this.prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    businessId: updateData.business_id || existingInvoice.businessId,
                    irn: updateData.irn || existingInvoice.irn,
                    issueDate: updateData.issue_date
                        ? new Date(updateData.issue_date)
                        : existingInvoice.issueDate,
                    dueDate: updateData.due_date
                        ? new Date(updateData.due_date)
                        : existingInvoice.dueDate,
                    issueTime: updateData.issue_time || existingInvoice.issueTime,
                    invoiceTypeCode: updateData.invoice_type_code || existingInvoice.invoiceTypeCode,
                    paymentStatus: updateData.payment_status || existingInvoice.paymentStatus,
                    note: updateData.note || existingInvoice.note,
                    taxPointDate: updateData.tax_point_date
                        ? new Date(updateData.tax_point_date)
                        : existingInvoice.taxPointDate,
                    documentCurrencyCode: updateData.document_currency_code ||
                        existingInvoice.documentCurrencyCode,
                    taxCurrencyCode: updateData.tax_currency_code || existingInvoice.taxCurrencyCode,
                    accountingCost: updateData.accounting_cost || existingInvoice.accountingCost,
                    buyerReference: updateData.buyer_reference || existingInvoice.buyerReference,
                    orderReference: updateData.order_reference || existingInvoice.orderReference,
                    actualDeliveryDate: updateData.actual_delivery_date
                        ? new Date(updateData.actual_delivery_date)
                        : existingInvoice.actualDeliveryDate,
                    paymentTermsNote: updateData.payment_terms_note || existingInvoice.paymentTermsNote,
                    status: "PENDING",
                    updatedAt: new Date(),
                },
                include: {
                    invoiceDeliveryPeriod: true,
                    accountingSupplierParty: {
                        include: {
                            postalAddress: true,
                        },
                    },
                    accountingCustomerParty: {
                        include: {
                            postalAddress: true,
                        },
                    },
                    billingReferences: true,
                    documentReferences: true,
                    dispatchDocumentReference: true,
                    receiptDocumentReference: true,
                    originatorDocumentReference: true,
                    contractDocumentReference: true,
                    paymentMeans: true,
                    allowanceCharges: true,
                    taxTotals: {
                        include: {
                            taxSubtotals: {
                                include: {
                                    taxCategory: true,
                                },
                            },
                        },
                    },
                    legalMonetaryTotal: true,
                    invoiceLines: {
                        include: {
                            item: true,
                            price: true,
                        },
                    },
                },
            });
            this.logger.log(`Successfully updated invoice with ID: ${invoiceId}`);
            return updatedInvoice;
        }
        catch (error) {
            this.logger.error(`Failed to update invoice with ID: ${invoiceId}`, error.stack);
            throw error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException ? error : new common_1.InternalServerErrorException(`Failed to update invoice: ${error.message}`);
        }
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = InvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map