import { DirectorDto } from "./register-user.dto";
export declare class CompleteProfileDto {
    entityId: string;
    businessName: string;
    businessAddress: string;
    rcNumber: string;
    dateOfIncorporation?: string;
    directors?: DirectorDto[];
    firsApiKey: string;
    firsApiSecret: string;
    firsPublicKeyBase64: string;
    firsCertificateBase64: string;
    businessId: string;
    irnTemplate: string;
    erpName?: string;
}
