import { ConfigurationService } from "./configuration.service";
export declare class ConfigurationController {
    private readonly configurationService;
    constructor(configurationService: ConfigurationService);
    getInvoiceTypes(): Promise<import("./configuration.service").InvoiceType[]>;
    getPaymentMeans(): Promise<import("./configuration.service").PaymentMean[]>;
    getTaxCategories(): Promise<import("./configuration.service").TaxCategory[]>;
    getCurrencies(): Promise<import("./configuration.service").Currency[]>;
    getVatExemptions(): Promise<import("./configuration.service").VatExemption[]>;
    getProductCodes(): Promise<import("./configuration.service").ProductCode[]>;
    getServiceCodes(): Promise<import("./configuration.service").ServiceCode[]>;
    getLocalGovernments(): Promise<import("./configuration.service").LocalGovernment[]>;
    getStateCodes(): Promise<import("./configuration.service").State[]>;
    smokeTest(): Promise<{
        message: string;
        timestamp: string;
    }>;
}
