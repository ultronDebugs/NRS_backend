// src/modules/auth/dtos/register.dto.ts
import { OmitType } from "@nestjs/swagger";
import { CreateUserDto } from "../../users/dtos/create-user.dto";

// We omit the 'role' field to prevent mass assignment (privilege escalation)
export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {}
