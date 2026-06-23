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
 * Data Transfer Object for updating FIRS settings.
 */
export class UpdateFirsSettingsDto {
  @ApiProperty({
    description: "User ID to associate the FIRS settings with",
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  @Type(() => Number)
  readonly userId: number;

  @ApiPropertyOptional({
    description: "Base64-encoded FIRS public key",
    example: "LS0tLS1CRUdJTi...",
  })
  @IsOptional()
  @IsString()
  @Length(1, 10000)
  readonly firsPublicKeyBase64?: string;

  @ApiPropertyOptional({
    description: "Base64-encoded FIRS certificate",
    example: "LS0tLS1CRUdJTi...",
  })
  @IsOptional()
  @IsString()
  @Length(1, 10000)
  readonly firsCertificateBase64?: string;
}
