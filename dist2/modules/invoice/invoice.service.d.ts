import { PrismaService } from "../../database";
import { ValidateIrnDto, ValidateInvoiceDto, CreateInvoiceDto, UpdateInvoiceDto } from "./dtos";
export declare class InvoiceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private readonly firsApiUrl;
    private readonly firsApiKey;
    private readonly firsApiSecret;
    private getFirsHeadersForBusiness;
    private buildFirsHeaders;
    private parseTransmitError;
    private createTransmitException;
    private sendTransmitInvoiceRequest;
    private updateInvoiceTransmissionFailure;
    getEntityById(entityId: string): Promise<any>;
    validateIrn(params: ValidateIrnDto): Promise<{
        ok: boolean;
    }>;
    validateInvoice(params: ValidateInvoiceDto): Promise<{
        ok: boolean;
    }>;
    signInvoice(params: ValidateInvoiceDto): Promise<{
        ok: boolean;
    }>;
    transmitSelfHealthCheck(): Promise<any>;
    transmitLookupIrn(irn: string): Promise<any>;
    transmitLookupTin(tin: string): Promise<any>;
    transmitInvoice(irn: string): Promise<any>;
    transmitConfirmReceipt(irn: string): Promise<any>;
    transmitLookupIrnById(invoiceId: number): Promise<any>;
    transmitInvoiceById(invoiceId: number): Promise<any>;
    retryTransmitInvoiceById(invoiceId: number): Promise<any>;
    transmitConfirmReceiptById(invoiceId: number): Promise<any>;
    transmitPullInvoice(userId?: number): Promise<any>;
    getInvoiceConfirmation(irn: string): Promise<any>;
    getInvoicesByUserId(userId: number, page?: number, limit?: number): Promise<{
        invoices: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getInvoiceById(invoiceId: number): Promise<any>;
    signInvoiceById(invoiceId: number): Promise<{
        ok: boolean;
        invoice: any;
    }>;
    confirmInvoiceById(invoiceId: number): Promise<{
        ok: boolean;
        invoice: any;
    }>;
    private convertInvoiceToDto;
    createInvoice(data: CreateInvoiceDto, userId: number): Promise<any>;
    updateInvoiceById(invoiceId: number, updateData: UpdateInvoiceDto): Promise<any>;
}
