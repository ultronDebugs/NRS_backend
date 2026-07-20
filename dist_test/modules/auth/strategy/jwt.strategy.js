"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/users.service");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    usersService;
    logger = new common_1.Logger(JwtStrategy_1.name);
    constructor(configService, usersService) {
        const jwtSecret = configService.get("JWT_SECRET");
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        super({
            jwtFromRequest: (req) => {
                let token = null;
                if (req && req.cookies) {
                    token = req.cookies["Authentication"];
                }
                const bearerToken = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                const finalToken = token || bearerToken;
                if (process.env.DEBUG_AUTH === "true") {
                    console.log(`[AuthDebug] Path: ${req.url}`);
                    console.log(`[AuthDebug] Cookie Token: ${token ? "Found" : "Missing"}`);
                    console.log(`[AuthDebug] Bearer Token: ${bearerToken ? "Found" : "Missing"}`);
                    console.log(`[AuthDebug] Final Token extracted: ${finalToken ? "Yes" : "No"}`);
                }
                return finalToken;
            },
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
        this.configService = configService;
        this.usersService = usersService;
    }
    async validate(payload) {
        try {
            if (!payload || !payload.sub) {
                this.logger.warn("Invalid JWT payload: missing sub field");
                throw new common_1.UnauthorizedException("Invalid token payload");
            }
            const user = await this.usersService.findUserById(payload.sub);
            if (!user) {
                this.logger.warn(`User not found for ID: ${payload.sub}`);
                throw new common_1.UnauthorizedException("User not found");
            }
            if (!user.isActive) {
                this.logger.warn(`Inactive user attempted access: ${payload.sub}`);
                throw new common_1.UnauthorizedException("User account is inactive");
            }
            return {
                id: user.id,
                email: user.email,
                username: user.businessName,
                entityId: payload.entityId,
                businessName: payload.businessName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Error validating JWT token: ${error.message}`, error.stack);
            throw new common_1.UnauthorizedException("Token validation failed");
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map