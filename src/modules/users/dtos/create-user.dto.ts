// src/modules/users/dto/create-user.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsIn } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
    required: true,
  })
  email: string;

  @IsIn(["ADMIN", "CLIENT"])
  @ApiProperty({
    description: "The role of the user",
    example: "CLIENT",
    required: true,
  })
  role: string;
}
