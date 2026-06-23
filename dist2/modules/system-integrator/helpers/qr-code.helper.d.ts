export interface GenerateQrCodeParams {
    irn: string;
    publicKeyBase64?: string;
    certificateBase64?: string;
}
export declare function generateFirsQrCodeWithKeys(params: GenerateQrCodeParams): string;
