import { SystemIntegratorService } from "./system-integrator.service";
import { FirsValidateInvoiceDto } from "../firs/dtos/validete-invoice.dto";
import { GenerateQrCodeDto, UpdateFirsSettingsDto } from "./dtos";
export declare class SystemIntegratorController {
    private readonly systemIntegratorService;
    private readonly logger;
    constructor(systemIntegratorService: SystemIntegratorService);
    validateInvoice(params: FirsValidateInvoiceDto): Promise<{
        ok: boolean;
    }>;
    generateQrCode(params: GenerateQrCodeDto): Promise<{
        qrCode: string;
    }>;
    getFirsSettings(userId: number): Promise<{
        firsPublicKeyBase64: string | null;
        firsCertificateBase64: string | null;
    } | null>;
    updateFirsSettings(params: UpdateFirsSettingsDto): Promise<{
        userId: number;
        firsPublicKeyBase64: string | null;
        firsCertificateBase64: string | null;
    }>;
    test(): Promise<{
        message: string;
        timestamp: string;
    }>;
}
