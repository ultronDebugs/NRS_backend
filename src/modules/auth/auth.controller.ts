import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Get,
  UseGuards,
  Res,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { CookieOptions, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterUserDto, CompleteProfileDto } from "../users/dtos";
import { LoginDto, ResendVerificationDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto } from "./dtos";
import { Public, CurrentUser } from "../../common/decorators";
import { EmailService } from "../../shared/email/mail.service";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Throttle } from "@nestjs/throttler";
function parseCookieSecure(): boolean {
  const value = process.env.COOKIE_SECURE;

  if (value === undefined) {
    return process.env.NODE_ENV === "production";
  }

  return value.toLowerCase() === "true";
}

function getAuthCookieOptions(): CookieOptions {
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();

  return {
    httpOnly: true,
    sameSite: ["strict", "lax"].includes(sameSite)
      ? (sameSite as "strict" | "lax")
      : "lax",
    secure: parseCookieSecure(),
    maxAge: 1000 * 60 * 60 * 24,
  };
}

@ApiTags("Authentication")
@Controller("api/v1/auth")
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("register")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Register a new user (Phase 1)" })
  @ApiResponse({ status: 202, description: "User registered successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return this.authService.register(registerUserDto);
  }

  /**
   * Phase 2: Complete or update profile with business info and directors.
   * Requires JWT from Phase 1 registration or login.
   */
  @ApiBearerAuth()
  @Post("complete-profile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Complete or update business profile (Phase 2)" })
  @ApiResponse({ status: 200, description: "Profile saved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async completeProfile(
    @CurrentUser() req: any,
    @Body() completeProfileDto: CompleteProfileDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.completeProfile(
      req.id,
      completeProfileDto,
    );
    res.cookie("Authentication", result.access_token, getAuthCookieOptions());
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    res.cookie("Authentication", result.access_token, getAuthCookieOptions());
    return result;
  }

  @Public()
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify user email with 6-digit OTP" })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend verification OTP" })
  @ApiResponse({ status: 200, description: "Verification email sent" })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerification(resendVerificationDto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({ status: 200, description: "Reset email sent if user exists" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password using token" })
  @ApiResponse({ status: 200, description: "Password successfully reset" })
  @ApiResponse({ status: 400, description: "Invalid token or passwords do not match" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiBearerAuth()
  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@CurrentUser() req: any) {
    const user = await this.authService.getProfile(req.id);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return user;
  }

  @ApiBearerAuth()
  @Post("sync-businesses")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sync businesses from FIRS" })
  @ApiResponse({ status: 200, description: "Businesses synced successfully" })
  async syncBusinesses(@CurrentUser() req: any) {
    return this.authService.syncEntityBusinesses(req.id);
  }

  // @Post('fetch-entity/:entityId')
  // @HttpCode(HttpStatus.OK)
  // async fetchEntityData(@Request() req, @Param('entityId') entityId: string) {
  //   const user = await this.authService.validateUser(req.user);
  //   if (!user) {
  //     throw new UnauthorizedException('User not found');
  //   }
  //   return this.authService.fetchAndSaveEntityData(entityId, user.id);
  // }

  @ApiBearerAuth()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({ status: 200, description: "Logged out successfully" })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("Authentication", getAuthCookieOptions());
    return { message: "Successfully logged out" };
  }

  // Test email endpoint (remove in production)
  @Public()
  @Post("test-email")
  async testEmail(@Body("email") email: string) {
    try {
      await this.emailService.sendCustomEmail(
        email,
        "Test Email",
        "<h1>Test Email</h1><p>If you receive this, email is working!</p>",
      );
      return { message: "Test email sent successfully!" };
    } catch (error) {
      return { message: "Failed to send test email", error: error.message };
    }
  }

  // Test email connection
  @Public()
  @Get("test-email-connection")
  async testEmailConnection() {
    const isConnected = await this.emailService.testConnection();
    return {
      connected: isConnected,
      message: isConnected
        ? "Email service is working!"
        : "Email service connection failed",
    };
  }
}
