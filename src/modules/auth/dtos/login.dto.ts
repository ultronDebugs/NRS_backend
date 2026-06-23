// src/modules/auth/dto/login.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
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
}
