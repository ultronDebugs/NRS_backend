import { FirsService } from "./firs.service";
import { LoginDto, SearchEntityDto, WebhookPayloadDto, WebhookResponseDto } from "./dtos";
export declare class FirsController {
    private readonly firsService;
    private readonly logger;
    constructor(firsService: FirsService);
    authenticateTaxpayer(payload: LoginDto): Promise<any>;
    searchEntities(query: SearchEntityDto): Promise<any>;
    getEntity(entityId: string): Promise<any>;
    handleWebhook(payload: WebhookPayloadDto): Promise<WebhookResponseDto>;
    retryFailedWebhooks(): Promise<{
        message: string;
    }>;
}
