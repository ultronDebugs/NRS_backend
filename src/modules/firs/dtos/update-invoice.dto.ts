import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

/**
 * Data Transfer Object for updating the payment status of an invoice.
 */
export class UpdateInvoicePaymentStatusDto {
  @ApiProperty({
    description: "The Invoice Reference Number (IRN) of the invoice to update.",
    example: "IRN1234567890",
  })
  @IsString()
  readonly irn: string;

  @ApiProperty({
    description: "The new payment status for the invoice.",
    enum: ["PENDING", "PAID", "REJECTED"],
    example: "PAID",
  })
  @IsEnum(["PENDING", "PAID", "REJECTED"])
  readonly paymentStatus: "PENDING" | "PAID" | "REJECTED";

  @ApiPropertyOptional({
    description: "Optional reference string for the payment update.",
    example: "BANK-REF-2024-001",
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly reference?: string;
}
