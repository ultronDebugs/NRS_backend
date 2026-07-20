import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiPropertyOptional({
    description:
      "Business the product belongs to. Defaults to the user's first business.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  business_id?: string;

  @ApiPropertyOptional({
    description:
      "Category to inherit FIRS/tax defaults from. Blank product fields are copied from the category at creation.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category_id?: string;

  @ApiPropertyOptional({
    enum: ["GOOD", "SERVICE"],
    default: "GOOD",
  })
  @IsOptional()
  @IsIn(["GOOD", "SERVICE"])
  type?: string = "GOOD";

  @ApiProperty({ example: "Dangote Cement 50kg" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: "50kg bag of Portland cement" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: "CEM-50KG-DAN" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({
    description: "HS code for goods. Inherited from category if omitted.",
    example: "2523.29",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hs_code?: string;

  @ApiPropertyOptional({
    description: "ISIC/service code for services. Inherited from category if omitted.",
    example: "4100",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  service_code?: string;

  @ApiPropertyOptional({
    description: "Free-text FIRS product/service category label.",
    example: "Construction",
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  product_category?: string;

  @ApiProperty({ example: 5200, description: "Default unit price" })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  default_unit_price: number;

  @ApiPropertyOptional({ example: "C62", default: "C62" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  price_unit?: string = "C62";

  @ApiPropertyOptional({ example: "STANDARD_VAT", default: "STANDARD_VAT" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  tax_category?: string;

  @ApiPropertyOptional({ example: 7.5, default: 7.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  tax_rate?: number;

  @ApiPropertyOptional({ example: "SELLER-SKU-001" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sellers_item_identification?: string;
}