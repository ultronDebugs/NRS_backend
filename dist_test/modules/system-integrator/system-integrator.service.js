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
var SystemIntegratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemIntegratorService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../database");
const axios_1 = require("axios");
const qr_code_helper_1 = require("./helpers/qr-code.helper");
let SystemIntegratorService = SystemIntegratorService_1 = class SystemIntegratorService {
    prisma;
    logger = new common_1.Logger(SystemIntegratorService_1.name);
    firsApiUrl = process.env.FIRS_API_URL ?? "";
    systemIntegratorApiKey = process.env.SYSTEM_INTEGRATOR_API_KEY ?? "";
    systemIntegratorApiSecret = process.env.SYSTEM_INTEGRATOR_API_SECRET ?? "";
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateInvoice(params) {
        if (!this.firsApiUrl ||
            !this.systemIntegratorApiKey ||
            !this.systemIntegratorApiSecret) {
            throw new Error("System Integrator API credentials are not set in environment variables");
        }
        const url = `${this.firsApiUrl}/api/v1/invoice/validate`;
        try {
            this.logger.log(`Validating invoice with IRN: ${params.irn}`);
            const response = await axios_1.default.post(url, params, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.systemIntegratorApiKey,
                    "x-api-secret": this.systemIntegratorApiSecret,
                },
            });
            this.logger.log(`Successfully validated invoice with IRN: ${params.irn}`);
            if (response.data &&
                response.data.data &&
                typeof response.data.data.ok === "boolean") {
                return { ok: response.data.data.ok };
            }
            throw new Error("Invalid response from FIRS API");
        }
        catch (error) {
            this.logger.error(`Failed to validate invoice with IRN: ${params.irn}`, error.stack);
            if (error.response) {
                throw new Error(`Failed to validate invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Failed to validate invoice: ${error.message}`);
        }
    }
    async generateQrCode(params) {
        const now = new Date();
        const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '') + String(now.getMilliseconds()).padStart(3, '0');
        const irnWithTimestamp = `${params.irn}.${timePart}`;
        let publicKeyBase64 = params.firsPublicKeyBase64;
        let certificateBase64 = params.firsCertificateBase64;
        if ((!publicKeyBase64 || !certificateBase64) && params.userId) {
            const settings = await this.prisma.systemIntegratorFirsSettings.findUnique({
                where: { userId: params.userId },
            });
            if (settings) {
                publicKeyBase64 ??= settings.firsPublicKeyBase64 ?? undefined;
                certificateBase64 ??= settings.firsCertificateBase64 ?? undefined;
            }
        }
        try {
            this.logger.log(`Generating QR code for IRN: ${params.irn}`);
            const qrCode = (0, qr_code_helper_1.generateFirsQrCodeWithKeys)({
                irn: irnWithTimestamp,
                publicKeyBase64,
                certificateBase64,
            });
            this.logger.log(`Successfully generated QR code for IRN: ${params.irn}`);
            return { qrCode };
        }
        catch (error) {
            this.logger.error(`Failed to generate QR code for IRN: ${params.irn}`, error.stack);
            throw new Error(`Failed to generate QR code: ${error.message}`);
        }
    }
    async getFirsSettings(userId) {
        const settings = await this.prisma.systemIntegratorFirsSettings.findUnique({
            where: { userId },
        });
        if (!settings) {
            return null;
        }
        return {
            firsPublicKeyBase64: settings.firsPublicKeyBase64,
            firsCertificateBase64: settings.firsCertificateBase64,
        };
    }
    async updateFirsSettings(params) {
        const settings = await this.prisma.systemIntegratorFirsSettings.upsert({
            where: { userId: params.userId },
            create: {
                userId: params.userId,
                firsPublicKeyBase64: params.firsPublicKeyBase64 ?? null,
                firsCertificateBase64: params.firsCertificateBase64 ?? null,
            },
            update: {
                firsPublicKeyBase64: params.firsPublicKeyBase64 !== undefined
                    ? (params.firsPublicKeyBase64 ?? null)
                    : undefined,
                firsCertificateBase64: params.firsCertificateBase64 !== undefined
                    ? (params.firsCertificateBase64 ?? null)
                    : undefined,
            },
        });
        return {
            userId: settings.userId,
            firsPublicKeyBase64: settings.firsPublicKeyBase64,
            firsCertificateBase64: settings.firsCertificateBase64,
        };
    }
};
exports.SystemIntegratorService = SystemIntegratorService;
exports.SystemIntegratorService = SystemIntegratorService = SystemIntegratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService])
], SystemIntegratorService);
//# sourceMappingURL=system-integrator.service.js.map