// src/shared/email/dto/send-email.dto.ts
import { IsEmail, IsString, IsOptional, IsArray } from "class-validator";

export class SendEmailDto {
  @IsEmail({}, { each: true })
  to: string | string[];

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  context?: Record<string, any>;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  text?: string;
}
