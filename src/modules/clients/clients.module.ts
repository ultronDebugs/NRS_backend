import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { InvoiceModule } from "../invoice/invoice.module";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";
import { ApiKeyAuthGuard } from "./security/api-key-auth.guard";

@Module({
  imports: [DatabaseModule, InvoiceModule],
  controllers: [ClientsController],
  providers: [ClientsService, ApiKeyAuthGuard],
  exports: [ClientsService],
})
export class ClientsModule {}
