import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  IsIn,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

export class DirectorDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({
    description: "First name of the director",
    example: "John",
    required: true,
  })
  firstName: string;

  @IsString()
  @MinLength(1)
  @ApiProperty({
    description: "Last name of the director",
    example: "Doe",
    required: true,
  })
  lastName: string;

  @IsEmail()
  @ApiProperty({
    description: "Email address of the director",
    example: "john.doe@example.com",
    required: true,
  })
  email: string;

  @IsString()
  @MinLength(10)
  @ApiProperty({
    description: "Phone number of the director",
    example: "+2348012345678",
    required: true,
  })
  phoneNumber: string;

  @IsString()
  @MinLength(11)
  @ApiProperty({
    description: "National Identification Number of the director",
    example: "12345678901",
    required: true,
  })
  nin: string;
}

export class RegisterUserDto {
  @IsEmail()
  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
    required: true,
  })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: "The password of the user",
    example: "password123",
    required: true,
  })
  password: string;

  @IsOptional()
  @IsIn(["USER", "CLIENT"])
  @ApiProperty({
    description: "The role to assign during public registration",
    example: "CLIENT",
    required: false,
    enum: ["USER", "CLIENT"],
    default: "USER",
  })
  role?: "USER" | "CLIENT";
}
