import { IsString, IsNotEmpty, IsIn } from "class-validator";

export class WebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  irn: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["TRANSMITTING", "TRANSMITTED", "ACKNOWLEDGED", "FAILED"])
  message: "TRANSMITTING" | "TRANSMITTED" | "ACKNOWLEDGED" | "FAILED";
}

export interface WebhookResponseDto {
  success: boolean;
  message: string;
  timestamp: string;
}
