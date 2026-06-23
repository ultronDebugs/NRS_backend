import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class SimplePostalAddressDto {
  @ApiProperty({ example: "32, owonikoko street" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  street_name: string;

  @ApiProperty({ example: "Gwarinpa" })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city_name: string;

  @ApiProperty({ example: "023401" })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postal_zone: string;

  @ApiPropertyOptional({ example: "NG", default: "NG" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country?: string = "NG";

  @ApiProperty({ example: "Ikeja" })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lga: string;

  @ApiProperty({ example: "Lagos" })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  state: string;
}

class SimplePartyDto {
  @ApiProperty({ example: "Genius-Excel Digital Services Ltd" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  party_name: string;

  @ApiProperty({ example: "33779413-0001" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  tin: string;

  @ApiProperty({ example: "business@email.com" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "+23480254099000" })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: "Telephone must start with + and include country code",
  })
  telephone?: string;

  @ApiPropertyOptional({ example: "Sales of cement and building materials" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  business_description?: string;

  @ApiProperty({ type: SimplePostalAddressDto })
  @ValidateNested()
  @Type(() => SimplePostalAddressDto)
  postal_address: SimplePostalAddressDto;
}

class SimpleInvoiceItemDto {
  @ApiProperty({ example: "Cement" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: "50kg bag of cement" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(0.000001)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unit_price: number;

  @ApiPropertyOptional({
    description: "HS code for goods. Use this or isic_code for services.",
    example: "8523.80.20",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hsn_code?: string;

  @ApiPropertyOptional({
    description: "Product category for goods.",
    example: "Technology",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  product_category?: string;

  @ApiPropertyOptional({
    description:
      "ISIC code for services. Stored as the line code when hsn_code is not supplied.",
    example: "4100",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  isic_code?: string;

  @ApiPropertyOptional({
    description: "Service category when the line is a service.",
    example: "Construction",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  service_category?: string;

  @ApiPropertyOptional({ example: "STANDARD_VAT", default: "STANDARD_VAT" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tax_category?: string = "STANDARD_VAT";

  @ApiPropertyOptional({ example: 7.5, default: 7.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  tax_rate?: number = 7.5;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount_amount?: number = 0;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fee_amount?: number = 0;

  @ApiPropertyOptional({ example: "EA" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  price_unit?: string;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional({
    description:
      "NRS business ID. If omitted, the first business linked to the user is used.",
    example: "bb99420d-d6bb-422c-b371-b9f6d6009aae",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  business_id?: string;

  @ApiProperty({ example: "INV001-94ND90NR-20240611" })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  irn: string;

  @ApiPropertyOptional({
    description: "Defaults to today when omitted.",
    example: "2024-05-14",
  })
  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @ApiPropertyOptional({ example: "2024-06-14" })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ example: "17:59:04" })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: "Issue time must be in HH:MM:SS format",
  })
  issue_time?: string;

  @ApiPropertyOptional({ example: "396", default: "396" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  invoice_type_code?: string = "396";

  @ApiPropertyOptional({ example: "B2B", default: "B2B", enum: ["B2B", "B2C", "B2G"] })
  @IsOptional()
  @IsString()
  @IsIn(["B2B", "B2C", "B2G"])
  invoice_kind?: string = "B2B";

  @ApiPropertyOptional({
    enum: ["PENDING", "PAID", "REJECTED"],
    default: "PENDING",
  })
  @IsOptional()
  @IsIn(["PENDING", "PAID", "REJECTED"])
  payment_status?: string = "PENDING";

  @ApiPropertyOptional({ example: "NGN", default: "NGN" })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  document_currency_code?: string = "NGN";

  @ApiPropertyOptional({
    description: "Defaults to document_currency_code when omitted.",
    example: "NGN",
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  tax_currency_code?: string;

  @ApiPropertyOptional({ example: "This invoice includes a bulk discount." })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @ApiPropertyOptional({
    description:
      "Override supplier details. If omitted, the authenticated user/business is used.",
    type: SimplePartyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SimplePartyDto)
  supplier?: SimplePartyDto;

  @ApiProperty({ type: SimplePartyDto })
  @ValidateNested()
  @Type(() => SimplePartyDto)
  customer: SimplePartyDto;

  @ApiProperty({ type: [SimpleInvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SimpleInvoiceItemDto)
  items: SimpleInvoiceItemDto[];
}
