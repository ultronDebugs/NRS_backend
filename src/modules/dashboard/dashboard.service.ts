import { Injectable } from "@nestjs/common";
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

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(userId: number): Promise<DashboardSummary> {
    const [
      totalInvoices,
      pendingInvoices,
      confirmedInvoices,
      signedInvoices,
      entity,
    ] = await Promise.all([
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

  async getClientDashboardSummary(
    userId: number,
  ): Promise<ClientDashboardSummary> {
    const [
      totalApiCalls,
      successfulCalls,
      failedCalls,
      validateInvoiceCalls,
      signInvoiceCalls,
      confirmInvoiceCalls,
      validateIrnCalls,
      apiCredential,
    ] = await Promise.all([
      (this.prisma as any).clientApiLog.count({ where: { userId } }),
      (this.prisma as any).clientApiLog.count({
        where: { userId, responseStatus: { gte: 200, lt: 300 } },
      }),
      (this.prisma as any).clientApiLog.count({
        where: { userId, responseStatus: { gte: 400 } },
      }),
      (this.prisma as any).clientApiLog.count({
        where: { userId, endpoint: "/api/v1/invoice/validate" },
      }),
      (this.prisma as any).clientApiLog.count({
        where: { userId, endpoint: "/api/v1/invoice/sign" },
      }),
      (this.prisma as any).clientApiLog.count({
        where: { userId, endpoint: { contains: "/api/v1/invoice/confirm/" } },
      }),
      (this.prisma as any).clientApiLog.count({
        where: { userId, endpoint: "/api/v1/invoice/irn/validate" },
      }),
      (this.prisma as any).clientApiCredential.findUnique({
        where: { userId },
      }),
    ]);

    const lastApiCall = await (this.prisma as any).clientApiLog.findFirst({
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

  async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const [totalUsers, totalClients, totalInvoices, totalApiCalls] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: "CLIENT" } }),
        this.prisma.invoice.count(),
        (this.prisma as any).clientApiLog.count(),
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

    const recentApiCalls = await (this.prisma as any).clientApiLog.findMany({
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

    // Check system health
    const systemHealth = {
      databaseConnected: true, // If we got here, DB is connected
      firsApiConfigured: !!(
        process.env.FIRS_API_URL &&
        process.env.FIRS_API_KEY &&
        process.env.FIRS_API_SECRET
      ),
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
}
