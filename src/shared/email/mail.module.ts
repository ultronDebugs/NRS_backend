// src/shared/email/email.module.ts
import { Module, Global } from "@nestjs/common";
import { EmailService } from "./mail.service";

@Global() // Make EmailService available globally
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
