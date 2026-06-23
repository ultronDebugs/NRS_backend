import { PrismaService } from "../../database";
import { InvoiceService } from "../invoice/invoice.service";
export interface ProxyResult {
    ok: boolean;
    data?: any;
}
export declare class ClientsService {
    private readonly prisma;
    private readonly invoiceService;
    private readonly logger;
    constructor(prisma: PrismaService, invoiceService: InvoiceService);
    createOrRotateKeys(userId: number): Promise<{
        apiKey: string;
        apiSecret: string;
    }>;
    getKeys(userId: number): Promise<{
        apiKey: string;
        apiSecretMasked: string;
    } | null>;
    proxyValidateInvoice(userId: number, payload: any): Promise<ProxyResult>;
    proxySignInvoice(userId: number, payload: any): Promise<ProxyResult>;
    proxyConfirmInvoice(userId: number, irn: string): Promise<ProxyResult>;
    proxyValidateIrn(userId: number, payload: any): Promise<ProxyResult>;
    proxyTransmitSelfHealthCheck(userId: number): Promise<ProxyResult>;
    proxyTransmitLookupIrn(userId: number, irn: string): Promise<ProxyResult>;
    proxyTransmitLookupTin(userId: number, tin: string): Promise<ProxyResult>;
    proxyTransmitInvoice(userId: number, irn: string): Promise<ProxyResult>;
    proxyTransmitConfirmReceipt(userId: number, irn: string): Promise<ProxyResult>;
    proxyTransmitPullInvoice(userId: number): Promise<ProxyResult>;
    getLogs(userId: number, page?: number, limit?: number): Promise<{
        logs: any;
        total: any;
        page: number;
        limit: number;
    }>;
    private saveLog;
    private ensureClient;
    private verifyIrnOwnership;
    private generateToken;
}
