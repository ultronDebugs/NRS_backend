import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * DTO for updating the payment status of an invoice.
 * Uses FIRS-standard payment status values only.
 *
 * This is a focused DTO — unlike UpdateInvoiceDto which updates the entire
 * invoice, this only touches the payment_status field and optionally a
 * payment reference string.
 */
export class UpdatePaymentStatusDto {
  @ApiProperty({
    description:
      "The new payment status for the invoice. Must be a FIRS-standard value.",
    enum: ["PENDING", "PAID", "REJECTED"],
    example: "PAID",
  })
  @IsEnum(["PENDING", "PAID", "REJECTED"], {
    message: "payment_status must be one of: PENDING, PAID, REJECTED",
  })
  payment_status: "PENDING" | "PAID" | "REJECTED";

  @ApiPropertyOptional({
    description:
      "Optional payment reference string (e.g. bank transfer reference, receipt number).",
    example: "BANK-REF-2026-001",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string;
}
