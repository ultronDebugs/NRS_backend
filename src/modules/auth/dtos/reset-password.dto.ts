import { IsString, IsNotEmpty, MinLength, Matches, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({
    description: "The JWT token from the password reset email",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: "The new password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)",
    example: "MyNewStrongPassword123!",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character",
  })
  newPassword: string;

  @ApiProperty({
    description: "Confirm the new password (must match newPassword)",
    example: "MyNewStrongPassword123!",
  })
  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}
