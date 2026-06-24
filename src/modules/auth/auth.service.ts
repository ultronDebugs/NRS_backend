import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  BadGatewayException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { JwtPayload } from "./interface/jwt-payload.interface";
import { compare, hash } from "bcryptjs";
import { RegisterUserDto, CompleteProfileDto } from "../users/dtos";
import { LoginDto, ResendVerificationDto, VerifyEmailDto, ResetPasswordDto } from "./dtos";
import * as bcrypt from "bcryptjs";
import { EmailService } from "../../shared/email/mail.service";
import { PrismaService } from "../../database";
import axios from "axios";
import { encryptIfPlaintext } from "../../shared/helpers/crypto.util";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly firsApiUrl: string = process.env.FIRS_API_URL ?? "";
  private readonly firsApiKey: string = process.env.SYSTEM_INTEGRATOR_API_KEY ?? "";
  private readonly firsApiSecret: string = process.env.SYSTEM_INTEGRATOR_API_SECRET ?? "";

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) { }

  private async buildBusinessContext(userId: number): Promise<{
    entityId: string | null;
    business_id: string | null;
    businesses: Array<{
      business_id: string;
      name: string;
      tin: string;
      is_active: boolean;
    }>;
  }> {
    const entity = await this.prisma.entity.findFirst({
      where: { userId },
      include: { businesses: true },
    });

    const businesses = (entity?.businesses ?? []).map((business) => ({
      business_id: business.id,
      name: business.name,
      tin: business.tin,
      is_active: business.isActive,
    }));

    return {
      entityId: entity?.id ?? null,
      business_id: businesses[0]?.business_id ?? null,
      businesses,
    };
  }

  private sanitizeUserProfile(user: any): any {
    const {
      password,
      emailVerificationToken,
      emailVerificationExpires,
      ...safeUser
    } = user;
    return safeUser;
  }

  /**
   * Extracts the middle part of the IRN template (e.g., "9BB244DE" from "{{invoice_id(e.g:INV00XXX)}}-9BB244DE-{{YYYYMMDD(e.g:20250909)}}")
   * @param irnTemplate - The full IRN template string
   * @returns The extracted middle part or the original string if pattern doesn't match
   */
  private extractIrnTemplate(irnTemplate: string): string {
    if (!irnTemplate) return irnTemplate;

    // Pattern to match: {{...}}-MIDDLE_PART-{{...}}
    const match = irnTemplate.match(/\{\{.*?\}\}-([A-Z0-9]+)-\{\{.*?\}\}/);
    return match ? match[1] : irnTemplate;
  }

  /**
   * Phase 1: Lightweight registration with email + password only.
   * User gets a JWT and lands on the dashboard with isProfileComplete: false.
   */
  async register(registerUserDto: RegisterUserDto) {
    try {
      const existingUser = await this.userService.findUserByEmail(
        registerUserDto.email,
      );

      if (existingUser) {
        // If user is already verified, block them (Mass Assignment/Account Discovery protection)
        if (existingUser.isEmailVerified) {
          throw new ConflictException("User already exists");
        }

        // If user exists but is NOT verified, treat this as a "Resend OTP" request
        // and return a successful registration response to keep the frontend flow smooth.
        const verificationToken =
          await this.userService.generateNewVerificationToken(
            existingUser.email,
          );

        try {
          await this.emailService.sendVerificationEmail(existingUser.email, {
            businessName: existingUser.email,
            verificationToken,
            verificationUrl: "",
          });
        } catch (emailError) {
          this.logger.error(
            `Failed to resend verification email during re-registration: ${emailError.message}`,
          );
        }

        return {
          message: "Email already registered but unverified. A new OTP has been sent. Please verify your email.",
        };
      }

      // Create user with just email + password
      const user =
        await this.userService.createUserLightweight(registerUserDto);

      // Send verification email with OTP
      try {
        await this.emailService.sendVerificationEmail(user.email, {
          businessName: user.email, // Fallback since businessName isn't collected yet
          verificationToken: user.emailVerificationToken ?? "",
          verificationUrl: "", // No longer used in template
        });
      } catch (emailError) {
        this.logger.error(
          `Failed to send verification email during registration: ${emailError.message}`,
        );
      }

      return {
        message: "Registration successful. Please verify your email to continue.",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Phase 2: Complete or update profile with business info and directors.
   * Called from within the dashboard after the user is already authenticated.
   * Returns a fresh JWT with updated business claims.
   */
  async completeProfile(userId: number, completeProfileDto: CompleteProfileDto) {
    // Sync with FIRS if entityId is provided to validate existence and prevent Organisation Hijacking (C1)
    // We do this BEFORE updating the user profile so that a fabricated entityId throws an error and rejects the request.
    if (completeProfileDto.entityId) {
      await this.fetchAndSaveEntityData(completeProfileDto.entityId, userId, completeProfileDto);
    }

    const user = await this.userService.completeProfile(
      userId,
      completeProfileDto,
    );

    const businessContext = await this.buildBusinessContext(user.id);

    // Issue a fresh JWT with the updated business context
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      entityId: user.entityId ?? "",
      businessName: user.businessName ?? "",
      role: user.role,
    };

    const directors = (user as any).directors ?? [];

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        businessName: user.businessName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      isEmailVerified: user.isEmailVerified,
      isProfileComplete: true,
      entity_id: businessContext.entityId ?? user.entityId ?? null,
      business_id: businessContext.business_id,
      businesses: businessContext.businesses,
      directors,
    };
  }

  async login(loginDto: LoginDto) {
    try {
      // Find user
      const user = await this.userService.findUserByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException("Account is deactivated");
      }

      // Verify password first (before checking email verification)
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid email or password");
      }

      // Check if user is email verified — return 200 with verification status
      // so the frontend can redirect to OTP screen instead of showing an error
      if (!user.isEmailVerified) {
        // Auto-resend verification OTP
        try {
          const verificationToken =
            await this.userService.generateNewVerificationToken(user.email);

          await this.emailService.sendVerificationEmail(user.email, {
            businessName: user.businessName ?? user.email,
            verificationToken,
            verificationUrl: "",
          });
        } catch (emailError) {
          this.logger.error(
            `Failed to resend verification email during login: ${emailError.message}`,
          );
        }

        const payload: JwtPayload = {
          sub: user.id,
          email: user.email,
          entityId: user.entityId ?? "",
          businessName: user.businessName ?? "",
          role: user.role,
        };

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: false,
          },
          isEmailVerified: false,
          isProfileComplete: user.isProfileComplete ?? false,
          entity_id: null,
          business_id: null,
          businesses: [],
          message:
            "Email not yet verified. A new verification code has been sent to your email.",
        };
      }


      // Generate JWT token
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        entityId: user.entityId ?? "",
        businessName: user.businessName ?? "",
        role: user.role,
      };

      // if (user.entityId) {
      //   try {
      //     await this.fetchAndSaveEntityData(user.entityId, user.id);
      //   } catch (fetchError) {
      //     this.logger.warn(
      //       `Could not sync entity data with FIRS during login for user ${user.id}: ${fetchError.message}. Returning last known business records.`,
      //     );
      //   }
      // }

      const businessContext = await this.buildBusinessContext(user.id);
      // try {
      //   await this.emailService.sendWelcomeEmail(user.email, {
      //     businessName: user.businessAddress ?? '',
      //     email: user.email,
      //     loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      //   });
      // } catch (emailError) {
      //   console.error('Failed to send welcome email:', emailError);
      // }
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          businessName: user.businessName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        isEmailVerified: user.isEmailVerified,
        isProfileComplete: user.isProfileComplete ?? false,
        entity_id: businessContext.entityId ?? user.entityId ?? null,
        business_id: businessContext.business_id,
        businesses: businessContext.businesses,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userService.verifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.otp,
    );
    try {
      await this.emailService.sendWelcomeEmail(user.email, {
        businessName: user?.businessName ?? "",
        email: user.email ?? "",
        loginUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
    return user;
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    try {
      const verificationToken =
        await this.userService.generateNewVerificationToken(
          resendVerificationDto.email,
        );

      // Send new verification email
      const user = await this.userService.findUserByEmail(
        resendVerificationDto.email,
      );

      if (!user) {
        throw new BadRequestException("User not found");
      }

      await this.emailService.sendVerificationEmail(user.email, {
        businessName: user.businessName ?? user.email,
        verificationToken,
        verificationUrl: "",
      });

      return {
        message: "Verification email sent! Please check your inbox.",
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException("Failed to resend verification email");
    }
  }

  async validateUser(payload: any) {
    // This is used by the JWT strategy
    return await this.userService.findUserById(payload.id);
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const businessContext = await this.buildBusinessContext(userId);
    const safeUser = this.sanitizeUserProfile(user);

    const directors = (user as any).directors ?? [];

    return {
      ...safeUser,
      isProfileComplete: safeUser.isProfileComplete ?? false,
      entityId: businessContext.entityId ?? safeUser.entityId ?? null,
      business_id: businessContext.business_id,
      businesses: businessContext.businesses,
      directors,
    };
  }

  async syncEntityBusinesses(userId: number): Promise<any> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    if (!user.entityId) {
      throw new BadRequestException(
        "No entity ID is linked to this user. Register an entity first.",
      );
    }

    // await this.fetchAndSaveEntityData(user.entityId, user.id);
    const businessContext = await this.buildBusinessContext(userId);

    return {
      message: "Entity businesses synced successfully.",
      entity_id: businessContext.entityId ?? user.entityId,
      business_id: businessContext.business_id,
      businesses: businessContext.businesses,
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      };
    }

    // Generate reset token with a slice of the current password hash for revocation
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: "password-reset", hash: user.password.substring(0, 10) },
      { expiresIn: "1h" },
    );

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, {
        businessName: user.businessName ?? "",
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`,
        expiresIn: "1 hour",
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      throw new InternalServerErrorException("Failed to send password reset email");
    }

    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.token);
    } catch (error) {
      throw new BadRequestException("Invalid or expired password reset token");
    }

    if (payload.type !== "password-reset") {
      throw new BadRequestException("Invalid token type");
    }

    const user = await this.userService.findUserById(payload.sub);
    if (!user) {
      throw new BadRequestException("Invalid token");
    }

    // Token Revocation Check: Ensure the token was generated with the CURRENT password.
    // If the password was changed after the token was generated, the hash slice won't match.
    if (payload.hash !== user.password.substring(0, 10)) {
      throw new BadRequestException("This password reset token has already been used or is invalid");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: "Password has been successfully reset" };
  }

  /**
   * Fetches entity data from FIRS API and saves it to the database.
   * @param entityId - The entity ID to fetch from FIRS.
   * @param userId - The user ID to associate the entity with.
   * @returns The saved entity data with businesses.
   */
  async fetchAndSaveEntityData(entityId: string, userId: number, dto?: CompleteProfileDto): Promise<any> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/entity/${entityId}`;

    try {
      this.logger.log(
        `Fetching entity data from FIRS for entityId: ${entityId}`,
      );

      this.logger.log(
        `Bypassing FIRS API: Generating mock entity data for entityId: ${entityId} since no SI Key is available yet.`,
      );

      // MOCK DATA: Bypassing FIRS API because we don't have an SI key yet.

      if (!dto?.businessId) {
        throw new BadRequestException("Business ID must be provided as it is assigned by FIRS.");
      }
      if (!dto?.irnTemplate) {
        throw new BadRequestException("IRN Template must be provided.");
      }

      const entityData: any = {
        id: entityId,
        reference: "MOCK_REF",
        is_active: true,
        app_reference: "MOCK_APP",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        businesses: [
          {
            id: dto.businessId,
            reference: "MOCK_BIZ_REF",
            name: dto?.businessName || "MBS FISCAI DIGITAL SERVICES LTD",
            tin: "33779413-0001",
            sector: "Technology",
            annual_turnover: "10000000",
            support_peppol: false,
            is_realtime_reporting: false,
            notification_channels: "EMAIL",
            erp_system: dto?.erpName || "Others",
            irn_template: dto.irnTemplate,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

      this.logger.log(
        `Successfully fetched entity data for entityId: ${entityId}`,
      );

      // Check if this entity ID is already claimed by another user
      const entityById = await this.prisma.entity.findUnique({
        where: { id: entityId },
      });

      if (entityById && entityById.userId !== userId) {
        throw new ConflictException(
          `Entity ${entityId} is already registered to another user.`,
        );
      }

      // Check if this user already has an entity
      const existingEntity = await this.prisma.entity.findFirst({
        where: { userId },
        include: { businesses: true },
      });

      if (existingEntity) {
        this.logger.log(
          `Entity already exists for user ${userId}, updating...`,
        );

        // Update existing entity (may change the entity ID if user re-registered with FIRS)
        const updatedEntity = await this.prisma.entity.update({
          where: { id: existingEntity.id },
          data: {
            id: entityData.id,
            reference: entityData.reference,
            customSettings: entityData.custom_settings
              ? JSON.stringify(entityData.custom_settings)
              : null,
            isActive: entityData.is_active,
            appReference: entityData.app_reference,
            updatedAt: new Date(),
          },
          include: {
            businesses: true,
          },
        });

        // Upsert businesses instead of deleting and recreating
        if (entityData.businesses && entityData.businesses.length > 0) {
          for (const business of entityData.businesses) {
            await this.prisma.business.upsert({
              where: { id: business.id },
              update: {
                reference: business.reference,
                name: business.name,
                customSettings: business.custom_settings
                  ? JSON.stringify(business.custom_settings)
                  : null,
                tin: business.tin,
                sector: business.sector,
                annualTurnover: business.annual_turnover,
                supportPeppol: business.support_peppol,
                isRealtimeReporting: business.is_realtime_reporting,
                notificationChannels: business.notification_channels,
                erpSystem: business.erp_system,
                irnTemplate: this.extractIrnTemplate(business.irn_template),
                isActive: business.is_active,
                updatedAt: new Date(),
                firsApiKey: dto?.firsApiKey ? encryptIfPlaintext(dto.firsApiKey) : undefined,
                firsApiSecret: dto?.firsApiSecret ? encryptIfPlaintext(dto.firsApiSecret) : undefined,
                firsPublicKeyBase64: dto?.firsPublicKeyBase64 ?? undefined,
                firsCertificateBase64: dto?.firsCertificateBase64 ?? undefined,
              },
              create: {
                id: business.id,
                reference: business.reference,
                name: business.name,
                customSettings: business.custom_settings
                  ? JSON.stringify(business.custom_settings)
                  : null,
                tin: business.tin,
                sector: business.sector,
                annualTurnover: business.annual_turnover,
                supportPeppol: business.support_peppol,
                isRealtimeReporting: business.is_realtime_reporting,
                notificationChannels: business.notification_channels,
                erpSystem: business.erp_system,
                irnTemplate: this.extractIrnTemplate(business.irn_template),
                isActive: business.is_active,
                createdAt: new Date(business.created_at),
                updatedAt: new Date(business.updated_at),
                entityId: updatedEntity.id,
                firsApiKey: encryptIfPlaintext(dto?.firsApiKey),
                firsApiSecret: encryptIfPlaintext(dto?.firsApiSecret),
                firsPublicKeyBase64: dto?.firsPublicKeyBase64,
                firsCertificateBase64: dto?.firsCertificateBase64,
              },
            });
          }
        }

        return updatedEntity;
      } else {
        this.logger.log(`Creating new entity for user ${userId}`);

        // Create new entity with businesses
        const newEntity = await this.prisma.entity.create({
          data: {
            id: entityData.id,
            reference: entityData.reference,
            customSettings: entityData.custom_settings
              ? JSON.stringify(entityData.custom_settings)
              : null,
            isActive: entityData.is_active,
            appReference: entityData.app_reference,
            createdAt: new Date(entityData.created_at),
            updatedAt: new Date(entityData.updated_at),
            userId: userId,
            businesses: {
              create:
                entityData.businesses?.map((business: any) => ({
                  id: business.id,
                  reference: business.reference,
                  name: business.name,
                  customSettings: business.custom_settings
                    ? JSON.stringify(business.custom_settings)
                    : null,
                  tin: business.tin,
                  sector: business.sector,
                  annualTurnover: business.annual_turnover,
                  supportPeppol: business.support_peppol,
                  isRealtimeReporting: business.is_realtime_reporting,
                  notificationChannels: business.notification_channels,
                  erpSystem: business.erp_system,
                  irnTemplate: this.extractIrnTemplate(business.irn_template),
                  isActive: business.is_active,
                  createdAt: new Date(business.created_at),
                  updatedAt: new Date(business.updated_at),
                  firsApiKey: encryptIfPlaintext(dto?.firsApiKey),
                  firsApiSecret: encryptIfPlaintext(dto?.firsApiSecret),
                  firsPublicKeyBase64: dto?.firsPublicKeyBase64,
                  firsCertificateBase64: dto?.firsCertificateBase64,
                })) || [],
            },
          },
          include: {
            businesses: true,
          },
        });

        this.logger.log(
          `Successfully created entity with ID: ${newEntity.id} for user ${userId}`,
        );
        return newEntity;
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch and save entity data for entityId: ${entityId}`,
        error.stack,
      );

      // Re-throw NestJS HttpExceptions directly (ConflictException, BadRequestException, etc.)
      if (error.status && error.getResponse) {
        throw error;
      }

      if (error.response) {
        throw new BadGatewayException(
          `Failed to fetch entity from FIRS: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to fetch and save entity data: ${error.message}`);
    }
  }
}
