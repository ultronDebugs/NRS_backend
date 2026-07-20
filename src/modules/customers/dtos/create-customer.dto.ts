import { Type } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Postal address for a customer. Mirrors the shape used inline on invoices
 * (SimplePostalAddressDto) so a saved customer maps 1:1 onto an invoice party.
 */
export class CustomerAddressDto {
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

export class CreateCustomerDto {
  @ApiPropertyOptional({
    description:
      "Business the customer belongs to. Defaults to the user's first business when omitted.",
    example: "bb99420d-d6bb-422c-b371-b9f6d6009aae",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  business_id?: string;

  @ApiProperty({ example: "Acme Buyer Ltd" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  party_name: string;

  @ApiProperty({ example: "33779413-0001" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  tin: string;

  @ApiProperty({ example: "buyer@email.com" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "+2348025409900" })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: "Telephone must start with + and include country code",
  })
  telephone?: string;

  @ApiPropertyOptional({ example: "Wholesale distributor of building materials" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  business_description?: string;

  @ApiProperty({ type: CustomerAddressDto })
  @ValidateNested()
  @Type(() => CustomerAddressDto)
  postal_address: CustomerAddressDto;
}