import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, Length } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "The 6-digit OTP sent to the user's email",
    example: "123456",
    required: true,
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
