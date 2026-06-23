import { Module } from "@nestjs/common";
import { FirsService } from "./firs.service";
import { FirsController } from "./firs.controller";
import { DatabaseModule } from "../../database";

@Module({
  imports: [DatabaseModule],
  controllers: [FirsController],
  exports: [FirsService],
  providers: [FirsService],
})
export class FirsModule {}
