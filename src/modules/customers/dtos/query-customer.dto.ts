import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryCustomerDto {
  @ApiPropertyOptional({ description: "Page number (1-based)", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Case-insensitive search across name, TIN and email",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter to a specific business. Defaults to the user's first business.",
  })
  @IsOptional()
  @IsString()
  business_id?: string;

  @ApiPropertyOptional({
    description: "Include soft-deleted (inactive) customers",
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  include_inactive?: boolean = false;
}