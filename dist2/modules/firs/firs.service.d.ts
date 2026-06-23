import { PrismaService } from "../../database";
import { CountryEntity } from "./entities/countries.entities";
import { LoginDto } from "./dtos/firs-login.dto";
import { FirsLoginResponseEntity } from "./entities/firs-login.entity";
import { SearchEntityDto } from "./dtos/search-entity.dto";
import { ValidateIrnDto } from "./dtos/validate-irn.dto";
import { FirsValidateInvoiceDto } from "./dtos/validete-invoice.dto";
import { ConfirmEntity } from "./entities/confirm.entities";
import { UpdateInvoicePaymentStatusDto } from "./dtos/update-invoice.dto";
import { WebhookPayloadDto, WebhookResponseDto } from "./dtos/webhook.dto";
export declare class FirsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private readonly firsApiUrl;
    private readonly firsApiKey;
    private readonly firsApiSecret;
    private readonly siApiKey;
    private readonly siApiSecret;
    loginTaxpayer(loginDto: LoginDto): Promise<FirsLoginResponseEntity>;
    getEntityById(entityId: string): Promise<any>;
    searchEntitiesByReference(searchParams: SearchEntityDto): Promise<any>;
    getCountries(): Promise<CountryEntity[]>;
    getCurrencies(): Promise<any>;
    getTaxCategories(): Promise<any>;
    getPaymentMeans(): Promise<any>;
    getInvoiceTypes(): Promise<any>;
    getServiceCodes(): Promise<any>;
    getVatExemptions(): Promise<any>;
    validateIrn(params: ValidateIrnDto): Promise<{
        ok: boolean;
    }>;
    validateInvoice(params: FirsValidateInvoiceDto): Promise<{
        ok: boolean;
    }>;
    signInvoice(params: FirsValidateInvoiceDto): Promise<{
        ok: boolean;
    }>;
    getDecryptedInvoice(params: {
        irn: string;
        decryptionKey: string;
    }): Promise<string>;
    private decryptAes256Cfb;
    getInvoiceConfirmation(irn: string): Promise<ConfirmEntity>;
    updateInvoicePaymentStatus(params: UpdateInvoicePaymentStatusDto): Promise<{
        ok: boolean;
    }>;
    handleWebhookNotification(payload: WebhookPayloadDto): Promise<WebhookResponseDto>;
    private logWebhookEvent;
    private logFailedWebhook;
    private processWebhookByStatus;
    private handleTransmittingStatus;
    private handleTransmittedStatus;
    private handleAcknowledgedStatus;
    private handleFailedStatus;
    processFailedWebhooks(): Promise<void>;
}
