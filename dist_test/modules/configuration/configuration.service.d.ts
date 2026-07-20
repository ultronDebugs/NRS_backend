import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../database";
export interface InvoiceType {
    code: string;
    value: string;
}
export interface PaymentMean {
    code: string;
    value: string;
}
export interface TaxCategory {
    code: string;
    value: string;
}
export interface Currency {
    symbol: string;
    name: string;
    symbol_native: string;
    decimal_digits: number;
    rounding: number;
    code: string;
    name_plural: string;
}
export interface VatExemption {
    heading_no: string;
    harmonized_system_code: string;
    tariff_category: string;
    tariff: string;
    description: string;
}
export interface ProductCode {
    hscode: string;
    description: string;
}
export interface ServiceCode {
    description: string;
    code: string;
}
export interface LocalGovernment {
    name: string;
    code: string;
    state_code: string;
}
export interface State {
    name: string;
    code: string;
}
export declare class ConfigurationService {
    private readonly configService;
    private readonly prisma;
    private readonly firsApiUrl;
    private readonly firsApiKey;
    private readonly firsApiSecret;
    constructor(configService: ConfigService, prisma: PrismaService);
    private makeFirsApiRequest;
    private getCachedOrFetch;
    getInvoiceTypes(): Promise<InvoiceType[]>;
    getPaymentMeans(): Promise<PaymentMean[]>;
    getTaxCategories(): Promise<TaxCategory[]>;
    getCurrencies(): Promise<Currency[]>;
    getVatExemptions(): Promise<VatExemption[]>;
    getProductCodes(): Promise<ProductCode[]>;
    getServiceCodes(): Promise<ServiceCode[]>;
    getLocalGovernments(): Promise<LocalGovernment[]>;
    getStateCodes(): Promise<State[]>;
}
