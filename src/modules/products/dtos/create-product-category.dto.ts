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

export class CreateProductCategoryDto {
  @ApiPropertyOptional({
    description:
      "Business the category belongs to. Defaults to the user's first business.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  business_id?: string;

  @ApiProperty({ example: "Building Materials" })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: "Cement, sand, blocks and aggregates" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    enum: ["GOOD", "SERVICE"],
    default: "GOOD",
    description: "Whether products in this category are goods or services.",
  })
  @IsOptional()
  @IsIn(["GOOD", "SERVICE"])
  type?: string = "GOOD";

  @ApiPropertyOptional({
    description: "Default HS code for goods. Copied onto products at creation.",
    example: "2523.29",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  default_hs_code?: string;

  @ApiPropertyOptional({
    description: "Default ISIC/service code for services.",
    example: "4100",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  default_service_code?: string;

  @ApiPropertyOptional({
    description: "Default free-text FIRS product/service category label.",
    example: "Construction",
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  default_product_category?: string;

  @ApiPropertyOptional({ example: "STANDARD_VAT", default: "STANDARD_VAT" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  default_tax_category?: string = "STANDARD_VAT";

  @ApiPropertyOptional({ example: 7.5, default: 7.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  default_tax_rate?: number = 7.5;
}