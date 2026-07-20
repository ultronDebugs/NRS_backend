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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardSummary(userId) {
        const [totalInvoices, pendingInvoices, confirmedInvoices, signedInvoices, entity,] = await Promise.all([
            this.prisma.invoice.count({ where: { userId } }),
            this.prisma.invoice.count({ where: { userId, status: "PENDING" } }),
            this.prisma.invoice.count({ where: { userId, status: "CONFIRMED" } }),
            this.prisma.invoice.count({ where: { userId, status: "SIGNED" } }),
            this.prisma.entity.findFirst({
                where: { userId },
                include: { businesses: true },
            }),
        ]);
        const lastInvoice = await this.prisma.invoice.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
        });
        return {
            totalInvoices,
            pendingInvoices,
            confirmedInvoices,
            signedInvoices,
            totalBusinesses: entity?.businesses?.length ?? 0,
            lastInvoiceIssuedAt: lastInvoice?.createdAt
                ? lastInvoice.createdAt.toISOString()
                : undefined,
        };
    }
    async getClientDashboardSummary(userId) {
        const [totalApiCalls, successfulCalls, failedCalls, validateInvoiceCalls, signInvoiceCalls, confirmInvoiceCalls, validateIrnCalls, apiCredential,] = await Promise.all([
            this.prisma.clientApiLog.count({ where: { userId } }),
            this.prisma.clientApiLog.count({
                where: { userId, responseStatus: { gte: 200, lt: 300 } },
            }),
            this.prisma.clientApiLog.count({
                where: { userId, responseStatus: { gte: 400 } },
            }),
            this.prisma.clientApiLog.count({
                where: { userId, endpoint: "/api/v1/invoice/validate" },
            }),
            this.prisma.clientApiLog.count({
                where: { userId, endpoint: "/api/v1/invoice/sign" },
            }),
            this.prisma.clientApiLog.count({
                where: { userId, endpoint: { contains: "/api/v1/invoice/confirm/" } },
            }),
            this.prisma.clientApiLog.count({
                where: { userId, endpoint: "/api/v1/invoice/irn/validate" },
            }),
            this.prisma.clientApiCredential.findUnique({
                where: { userId },
            }),
        ]);
        const lastApiCall = await this.prisma.clientApiLog.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
        });
        return {
            totalApiCalls,
            successfulCalls,
            failedCalls,
            validateInvoiceCalls,
            signInvoiceCalls,
            confirmInvoiceCalls,
            validateIrnCalls,
            lastApiCallAt: lastApiCall?.createdAt
                ? lastApiCall.createdAt.toISOString()
                : undefined,
            apiKeyActive: apiCredential?.isActive ?? false,
        };
    }
    async getAdminDashboardSummary() {
        const [totalUsers, totalClients, totalInvoices, totalApiCalls] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: "CLIENT" } }),
            this.prisma.invoice.count(),
            this.prisma.clientApiLog.count(),
        ]);
        const recentUsers = await this.prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                businessName: true,
                role: true,
                createdAt: true,
                isActive: true,
            },
        });
        const recentApiCalls = await this.prisma.clientApiLog.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
            },
        });
        const systemHealth = {
            databaseConnected: true,
            firsApiConfigured: !!(process.env.FIRS_API_URL &&
                process.env.FIRS_API_KEY &&
                process.env.FIRS_API_SECRET),
        };
        return {
            totalUsers,
            totalClients,
            totalInvoices,
            totalApiCalls,
            recentUsers,
            recentApiCalls,
            systemHealth,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map