"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const users_module_1 = require("../users/users.module");
const database_1 = require("../../database");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const strategy_1 = require("./strategy");
const mail_module_1 = require("../../shared/email/mail.module");
const DEFAULT_JWT_EXPIRATION_SECONDS = 3600;
function parseExpirationToSeconds(value) {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
        return Number(trimmed) || DEFAULT_JWT_EXPIRATION_SECONDS;
    }
    const match = trimmed.match(/^(\d+)(s|m|h|d)$/i);
    if (!match) {
        return DEFAULT_JWT_EXPIRATION_SECONDS;
    }
    const num = Number(match[1]) || 1;
    const unit = match[2].toLowerCase();
    const multipliers = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
    };
    return num * (multipliers[unit] ?? 3600);
}
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            database_1.DatabaseModule,
            passport_1.PassportModule,
            mail_module_1.EmailModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const expiration = config.get("JWT_EXPIRATION", "3600");
                    const expiresInSeconds = parseExpirationToSeconds(expiration);
                    return {
                        secret: config.get("JWT_SECRET"),
                        signOptions: {
                            expiresIn: expiresInSeconds,
                        },
                    };
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, strategy_1.JwtStrategy],
        exports: [],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map