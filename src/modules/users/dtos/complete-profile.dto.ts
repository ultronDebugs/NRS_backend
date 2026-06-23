import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { DirectorDto } from "./register-user.dto";

export class CompleteProfileDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({
    description: "The NRS-issued Entity ID for the business",
    example: "9bb244de-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    required: true,
  })
  entityId: string;

  @IsString()
  @MinLength(3)
  @ApiProperty({
    description: "The registered business name",
    example: "Genius-Excel Technology Limited",
    required: true,
  })
  businessName: string;

  @IsString()
  @MinLength(3)
  @ApiProperty({
    description: "The registered business address",
    example: "123 Main St, Lagos, Nigeria",
    required: true,
  })
  businessAddress: string;

  @IsString()
  @MinLength(4)
  @ApiProperty({
    description: "The CAC registration certificate number",
    example: "RC123456",
    required: true,
  })
  rcNumber: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: "Date of incorporation (ISO format)",
    example: "2020-01-01",
    required: false,
  })
  dateOfIncorporation?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DirectorDto)
  @ApiProperty({
    description: "List of directors (optional)",
    type: [DirectorDto],
    required: false,
  })
  directors?: DirectorDto[];

  // ── FIRS Credentials (per-business) ──────────────────────────────

  @IsString()
  @ApiProperty({
    description:
      "The FIRS API Key from the business's FIRS Dashboard (Developer Settings → Apps)",
    example: "2483f0f8-6e72-4c52-b893-f11dc79afce1",
    required: true,
  })
  firsApiKey: string;

  @IsString()
  @ApiProperty({
    description:
      "The FIRS Client Secret from the business's FIRS Dashboard (Developer Settings → Apps)",
    example: "zSLuYPWOQD4OsoXUtHb3xz...",
    required: true,
  })
  firsApiSecret: string;

  @IsString()
  @ApiProperty({
    description:
      "Base64-encoded RSA public key from the crypto_keys.txt file downloaded from FIRS Dashboard → Manage Cryptographic Keys",
    required: true,
  })
  firsPublicKeyBase64: string;

  @IsString()
  @ApiProperty({
    description:
      "Base64-encoded certificate from the crypto_keys.txt file downloaded from FIRS Dashboard → Manage Cryptographic Keys",
    required: true,
  })
  firsCertificateBase64: string;

  @IsString()
  @ApiProperty({
    description: "The Business ID (UUID) associated with the entity",
    example: "ac30649a-8243-4fc8-b6a5-654606b8e734",
    required: true,
  })
  businessId: string;

  @IsString()
  @ApiProperty({
    description: "The IRN template assigned to this business",
    example: "{{invoice_id(e.g:INV00XXX)}}-0AB18243-{{YYYYMMDD(e.g:20260610)}}",
    required: true,
  })
  irnTemplate: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: "The ERP Name",
    example: "Others",
    required: false,
  })
  erpName?: string;
}
