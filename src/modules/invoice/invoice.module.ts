import { Module } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { InvoiceController } from "./invoice.controller";
import { DatabaseModule } from "../../database";

@Module({
  imports: [DatabaseModule],
  controllers: [InvoiceController],
  exports: [InvoiceService],
  providers: [InvoiceService],
})
export class InvoiceModule {}
