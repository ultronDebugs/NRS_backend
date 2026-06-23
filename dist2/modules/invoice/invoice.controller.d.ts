import { InvoiceService } from "./invoice.service";
import { GetEntityDto, CreateInvoiceDto, UpdateInvoiceDto } from "./dtos";
export declare class InvoiceController {
    private readonly invoiceService;
    private readonly logger;
    constructor(invoiceService: InvoiceService);
    private ensureInvoiceOwnership;
    getEntityById(user: any, params: GetEntityDto): Promise<any>;
    transmitSelfHealthCheck(): Promise<any>;
    transmitLookupTin(tin: string): Promise<any>;
    transmitPullInvoice(): Promise<any>;
    transmitLookupById(user: any, invoiceId: number): Promise<any>;
    transmitInvoiceById(user: any, invoiceId: number): Promise<any>;
    retryTransmitInvoiceById(user: any, invoiceId: number): Promise<any>;
    transmitConfirmReceiptById(user: any, invoiceId: number): Promise<any>;
    createInvoice(user: any, payload: CreateInvoiceDto): Promise<any>;
    getMyInvoices(user: any, page?: number, limit?: number): Promise<{
        invoices: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getInvoiceById(user: any, invoiceId: number): Promise<any>;
    signInvoiceById(user: any, invoiceId: number): Promise<{
        ok: boolean;
        invoice: any;
    }>;
    confirmInvoiceById(user: any, invoiceId: number): Promise<{
        ok: boolean;
        invoice: any;
    }>;
    updateInvoiceById(invoiceId: number, payload: UpdateInvoiceDto): Promise<any>;
}
