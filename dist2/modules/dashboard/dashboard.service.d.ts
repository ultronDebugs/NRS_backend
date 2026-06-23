import { PrismaService } from "../../database/prisma.service";
export interface DashboardSummary {
    totalInvoices: number;
    pendingInvoices: number;
    confirmedInvoices: number;
    signedInvoices: number;
    totalBusinesses: number;
    lastInvoiceIssuedAt?: string;
}
export interface ClientDashboardSummary {
    totalApiCalls: number;
    successfulCalls: number;
    failedCalls: number;
    validateInvoiceCalls: number;
    signInvoiceCalls: number;
    confirmInvoiceCalls: number;
    validateIrnCalls: number;
    lastApiCallAt?: string;
    apiKeyActive: boolean;
}
export interface AdminDashboardSummary {
    totalUsers: number;
    totalClients: number;
    totalInvoices: number;
    totalApiCalls: number;
    recentUsers: any[];
    recentApiCalls: any[];
    systemHealth: {
        databaseConnected: boolean;
        firsApiConfigured: boolean;
    };
}
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardSummary(userId: number): Promise<DashboardSummary>;
    getClientDashboardSummary(userId: number): Promise<ClientDashboardSummary>;
    getAdminDashboardSummary(): Promise<AdminDashboardSummary>;
}
