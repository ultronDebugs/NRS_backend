import { FirsService } from "./firs.service";
import { LoginDto, SearchEntityDto, WebhookPayloadDto, WebhookResponseDto } from "./dtos";
export declare class FirsController {
    private readonly firsService;
    private readonly logger;
    constructor(firsService: FirsService);
    authenticateTaxpayer(payload: LoginDto): Promise<any>;
    searchEntities(query: SearchEntityDto): Promise<any>;
    getEntity(entityId: string): Promise<any>;
    getTaxCategories(): Promise<any>;
    getPaymentMeans(): Promise<any>;
    getInvoiceTypes(): Promise<any>;
    getCurrencies(): Promise<any>;
    getCountries(): Promise<any>;
    getServiceCodes(): Promise<any>;
    getVatExemptions(): Promise<any>;
    getHsCodes(): Promise<any>;
    getLgas(): Promise<any>;
    getStates(): Promise<any>;
    handleWebhook(payload: WebhookPayloadDto): Promise<WebhookResponseDto>;
    retryFailedWebhooks(): Promise<{
        message: string;
    }>;
}
