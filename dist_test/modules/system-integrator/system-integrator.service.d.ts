import { PrismaService } from "../../database";
import { FirsValidateInvoiceDto } from "../firs/dtos/validete-invoice.dto";
import { GenerateQrCodeDto, UpdateFirsSettingsDto } from "./dtos";
export declare class SystemIntegratorService {
    private readonly prisma;
    private readonly logger;
    private readonly firsApiUrl;
    private readonly systemIntegratorApiKey;
    private readonly systemIntegratorApiSecret;
    constructor(prisma: PrismaService);
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
}
