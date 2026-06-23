import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { RolesGuard } from "../../common/guards/roles.guard";

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
