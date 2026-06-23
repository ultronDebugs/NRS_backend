// src/modules/users/dto/update-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  IsIn,
  IsBoolean,
  IsOptional,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  entityId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  businessAddress?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  rcNumber?: string;

  @IsOptional()
  @IsIn(["USER", "ADMIN", "CLIENT"])
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
