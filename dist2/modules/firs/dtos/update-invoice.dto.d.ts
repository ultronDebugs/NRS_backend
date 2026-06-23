export declare class UpdateInvoicePaymentStatusDto {
    readonly irn: string;
    readonly paymentStatus: "PENDING" | "PAID" | "REJECTED";
    readonly reference?: string;
}
