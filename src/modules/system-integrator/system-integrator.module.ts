import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database";
import { SystemIntegratorService } from "./system-integrator.service";
import { SystemIntegratorController } from "./system-integrator.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [SystemIntegratorController],
  exports: [SystemIntegratorService],
  providers: [SystemIntegratorService],
})
export class SystemIntegratorModule {}
