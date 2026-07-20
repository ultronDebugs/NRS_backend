"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("./modules/auth/guard/jwt-auth.guard");
const mail_module_1 = require("./shared/email/mail.module");
const firs_module_1 = require("./modules/firs/firs.module");
const invoice_module_1 = require("./modules/invoice/invoice.module");
const configuration_module_1 = require("./modules/configuration/configuration.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const clients_module_1 = require("./modules/clients/clients.module");
const system_integrator_module_1 = require("./modules/system-integrator/system-integrator.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: "default", ttl: 60000, limit: 120 },
            ]),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            mail_module_1.EmailModule,
            firs_module_1.FirsModule,
            invoice_module_1.InvoiceModule,
            configuration_module_1.ConfigurationModule,
            dashboard_module_1.DashboardModule,
            clients_module_1.ClientsModule,
            system_integrator_module_1.SystemIntegratorModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
        exports: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map