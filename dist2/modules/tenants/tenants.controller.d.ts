import { TenantsService } from "./tenants.service";
import { ValidateInvoiceDto, ValidateIrnDto } from "./dtos";
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    validateInvoice(payload: ValidateInvoiceDto, req: any): Promise<any>;
    signInvoice(payload: ValidateInvoiceDto, req: any): Promise<any>;
    confirmInvoice(irn: string, req: any): Promise<any>;
    transmitSelfHealthCheck(req: any): Promise<any>;
    transmitLookupTin(tin: string, req: any): Promise<any>;
    transmitLookupIrn(irn: string, req: any): Promise<any>;
    transmitPullInvoice(req: any): Promise<any>;
    transmitInvoice(irn: string, req: any): Promise<any>;
    transmitConfirmReceipt(irn: string, req: any): Promise<any>;
    validateIrn(payload: ValidateIrnDto, req: any): Promise<any>;
    getTaxCategories(req: any): Promise<any>;
    getPaymentMeans(req: any): Promise<any>;
    getCountries(req: any): Promise<any>;
    getCurrencies(req: any): Promise<any>;
    getInvoiceTypes(req: any): Promise<any>;
    getServiceCodes(req: any): Promise<any>;
    getVatExemptions(req: any): Promise<any>;
    getHsCodes(req: any): Promise<any>;
    getLgas(req: any): Promise<any>;
    getStates(req: any): Promise<any>;
    createOrRotateKeys(req: any): Promise<{
        apiKey: string;
        apiSecret: string;
    }>;
    getKeys(req: any): Promise<{
        apiKey: string;
        apiSecretMasked: string;
    } | null>;
    getLogs(page: string | undefined, limit: string | undefined, req: any): Promise<{
        logs: any;
        total: any;
        page: number;
        limit: number;
    }>;
}
