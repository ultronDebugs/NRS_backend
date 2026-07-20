import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  Matches,
  MaxLength,
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

  // ── Structured business contact & address (auto-fills the invoice supplier) ──

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: "businessPhone must be E.164 format, e.g. +2348025409900",
  })
  @ApiProperty({
    description: "Business phone in E.164 format. Auto-fills supplier.telephone.",
    example: "+2348025409900",
    required: false,
  })
  businessPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    description: "Short description of the business. Auto-fills supplier.businessDescription.",
    example: "Sale of cement and building materials",
    required: false,
  })
  businessDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ description: "Street name", example: "32, Owonikoko Street", required: false })
  streetName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: "City name", example: "Gwarinpa", required: false })
  cityName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/, { message: "postalZone must be 6 digits" })
  @ApiProperty({ description: "6-digit postal code", example: "023401", required: false })
  postalZone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: "State", example: "Lagos", required: false })
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: "Local Government Area", example: "Ikeja", required: false })
  lga?: string;

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
