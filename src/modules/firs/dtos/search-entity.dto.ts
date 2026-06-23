import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from "class-validator";

/**
 * Data Transfer Object for searching entities by reference.
 */
export class SearchEntityDto {
  @IsString()
  @ApiPropertyOptional({
    description: "The reference string to search for.",
    example: "REF123456",
    required: false,
  })
  @IsOptional()
  reference?: string;

  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({
    description: "The page number for pagination.",
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({
    description: "The number of results per page.",
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  size?: number = 20;

  @IsString()
  @ApiPropertyOptional({
    description: "The field to sort by.",
    example: "created_at",
    default: "created_at",
    required: false,
  })
  @IsOptional()
  sortBy?: string = "created_at";

  @IsBoolean()
  @ApiPropertyOptional({
    description: "Whether to sort in descending order.",
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  sortDirectionDesc?: boolean = true;
}
