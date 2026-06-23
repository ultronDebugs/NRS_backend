export declare class WebhookPayloadDto {
    irn: string;
    message: "TRANSMITTING" | "TRANSMITTED" | "ACKNOWLEDGED" | "FAILED";
}
export interface WebhookResponseDto {
    success: boolean;
    message: string;
    timestamp: string;
}
