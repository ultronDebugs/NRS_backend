import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { DatabaseModule } from "../../database";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";
import { EmailModule } from "../../shared/email/mail.module";

const DEFAULT_JWT_EXPIRATION_SECONDS = 3600;

/**
 * Parses JWT_EXPIRATION env value (e.g. "3600", "1h", "7d") to seconds.
 * Returns a number for JwtModule signOptions.expiresIn compatibility.
 */
function parseExpirationToSeconds(value: string): number {
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
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return num * (multipliers[unit] ?? 3600);
}

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiration = config.get<string>("JWT_EXPIRATION", "3600");
        const expiresInSeconds = parseExpirationToSeconds(expiration);
        return {
          secret: config.get<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: expiresInSeconds,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [],
})
export class AuthModule { }
