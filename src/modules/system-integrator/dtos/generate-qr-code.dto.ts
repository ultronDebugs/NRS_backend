import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

/**
 * Data Transfer Object for generating a QR code via System Integrator.
 */
export class GenerateQrCodeDto {
  @ApiProperty({
    description:
      "The Invoice Reference Number (IRN) for which to generate the QR code",
    example: "ITW001-E9E0C0D3-20240619",
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  readonly irn: string;

  @ApiPropertyOptional({
    description: "Base64-encoded FIRS public key (overrides stored/env value)",
    example: "LS0tLS1CRUdJTi...",
  })
  @IsOptional()
  @IsString()
  @Length(1, 10000)
  readonly firsPublicKeyBase64?: string;

  @ApiPropertyOptional({
    description: "Base64-encoded FIRS certificate (overrides stored/env value)",
    example: "LS0tLS1CRUdJTi...",
  })
  @IsOptional()
  @IsString()
  @Length(1, 10000)
  readonly firsCertificateBase64?: string;

  @ApiPropertyOptional({
    description:
      "User ID to use stored FIRS settings when payload keys not provided",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly userId?: number;
}
