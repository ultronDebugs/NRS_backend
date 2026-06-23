import { IsNotEmpty, IsString, Length } from "class-validator";

/**
 * Data Transfer Object for validating an IRN (Invoice Reference Number).
 */
export class ValidateIrnDto {
  /**
   * The reference of the invoice to validate.
   */
  @IsString()
  @IsNotEmpty()
  readonly invoiceReference: string;

  /**
   * The business ID associated with the invoice.
   */
  @IsString()
  @IsNotEmpty()
  readonly businessId: string;

  /**
   * The IRN (Invoice Reference Number) to validate.
   */
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  readonly irn: string;
}
