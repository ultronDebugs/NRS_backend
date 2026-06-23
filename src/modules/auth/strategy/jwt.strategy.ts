// src/modules/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";
import { JwtPayload } from "../interface/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies["Authentication"];
        }
        const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        const finalToken = token || bearerToken;

        // Debug logging only when explicitly enabled
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
  }

  async validate(payload: JwtPayload) {
    try {
      if (!payload || !payload.sub) {
        this.logger.warn("Invalid JWT payload: missing sub field");
        throw new UnauthorizedException("Invalid token payload");
      }

      const user = await this.usersService.findUserById(payload.sub);

      if (!user) {
        this.logger.warn(`User not found for ID: ${payload.sub}`);
        throw new UnauthorizedException("User not found");
      }

      if (!user.isActive) {
        this.logger.warn(`Inactive user attempted access: ${payload.sub}`);
        throw new UnauthorizedException("User account is inactive");
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
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Error validating JWT token: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException("Token validation failed");
    }
  }
}
