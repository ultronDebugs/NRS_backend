import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { JwtAuthGuard } from "./modules/auth/guard/jwt-auth.guard";
import { EmailModule } from "./shared/email/mail.module";
import { FirsModule } from "./modules/firs/firs.module";
import { InvoiceModule } from "./modules/invoice/invoice.module";
import { ConfigurationModule } from "./modules/configuration/configuration.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { SystemIntegratorModule } from "./modules/system-integrator/system-integrator.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60000, limit: 120 },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    EmailModule,
    FirsModule,
    InvoiceModule,
    ConfigurationModule,
    DashboardModule,
    ClientsModule,
    SystemIntegratorModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
