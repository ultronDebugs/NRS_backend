import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../database";
import { EmailService } from "../../shared/email/mail.service";
import {
  CreateUserDto,
  UpdateUserDto,
  RegisterUserDto,
  CompleteProfileDto,
} from "./dtos";
import * as bcrypt from "bcryptjs";
import { User } from "./entities/user.entity";
import * as crypto from "crypto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    // Check if user already exists with the same email
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUserByEmail) {
      throw new ConflictException("User with this email already exists");
    }

    // Check if user already exists with the same entityId
    // const existingUserByEntityId = await this.prisma.user.findUnique({
    //   where: {
    //     entityId: createUserDto.entityId,
    //   },
    // });

    // if (existingUserByEntityId) {
    //   throw new ConflictException('User with this entity ID already exists');
    // }

    // Generate random password and hash it
    const randomPassword = crypto.randomBytes(12).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Generate 6-digit OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        // entityId: crypto.randomUUID(),
        password: hashedPassword,
        // business fields intentionally omitted (nullable)
        role: createUserDto.role as any, // Cast to avoid type conflicts
        isEmailVerified: false,
        isProfileComplete: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });
    // Send email to user with password
    // await this.emailService.sendCustomEmail(
    //   createUserDto.email,
    //   'Your Account Credentials',
    //   `
    //     <h2>Welcome!</h2>
    //     <p>Your account has been created successfully.</p>
    //     <p><strong>Email:</strong> ${createUserDto.email}</p>
    //     <p><strong>Password:</strong> ${randomPassword}</p>
    //     <p>Please log in and change your password for security.</p>
    //   `,
    // );

    return {
      success: true,
      user: this.mapPrismaUserToEntity(user),
      password: randomPassword,
    };
  }

  /**
   * Lightweight registration: creates a user with only email and password.
   * Business information is collected later via completeProfile().
   */
  async createUserLightweight(
    registerUserDto: RegisterUserDto,
  ): Promise<User> {
    // Check if user already exists with the same email
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: {
        email: registerUserDto.email,
      },
    });

    if (existingUserByEmail) {
      throw new ConflictException("User with this email already exists");
    }

    const role = registerUserDto.role ?? "USER";
    if (!["USER", "CLIENT"].includes(role)) {
      throw new BadRequestException("Only USER or CLIENT can self-register");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    // Generate 6-digit OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user with minimal info
    const user = await this.prisma.user.create({
      data: {
        email: registerUserDto.email,
        password: hashedPassword,
        role: role as any,
        isEmailVerified: false,
        isProfileComplete: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    return this.mapPrismaUserToEntity(user);
  }

  /**
   * Phase 2: completes or updates a user's profile with business information and directors.
   */
  async completeProfile(
    userId: number,
    completeProfileDto: CompleteProfileDto,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check entityId uniqueness
    if (completeProfileDto.entityId) {
      const existingEntity = await this.prisma.user.findUnique({
        where: { entityId: completeProfileDto.entityId },
      });
      if (existingEntity && existingEntity.id !== userId) {
        throw new ConflictException("This entity ID is already in use");
      }
    }

    // Update user with business info and optionally replace directors
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        entityId: completeProfileDto.entityId,
        businessName: completeProfileDto.businessName,
        businessAddress: completeProfileDto.businessAddress,
        rcNumber: completeProfileDto.rcNumber,
        dateOfIncorporation: completeProfileDto.dateOfIncorporation
          ? new Date(completeProfileDto.dateOfIncorporation)
          : new Date(),
        isProfileComplete: true,
        ...(completeProfileDto.directors && {
          directors: {
            deleteMany: {},
            create: completeProfileDto.directors.map((d) => ({
              firstName: d.firstName,
              lastName: d.lastName,
              email: d.email,
              phoneNumber: d.phoneNumber,
              nin: d.nin,
            })),
          },
        }),
      },
      include: {
        directors: true,
      },
    });

    return this.mapPrismaUserToEntity(updatedUser);
  }

  async findAllUsers(): Promise<any[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
    });

    return users.map(({ password, ...user }) => user);
  }

  async findUserById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        directors: true,
        entity: {
          include: {
            businesses: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }
    return this.mapPrismaUserToEntity(user);
    // const { password, ...userWithoutPassword } = user;
    // return userWithoutPassword;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.mapPrismaUserToEntity(user); // Return with password for auth validation
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        role: updateUserDto.role as any, // Cast to avoid type conflicts
      },
    });

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByEmailAndOtp(email: string, otp: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
        emailVerificationToken: otp,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return null;
    }

    return this.mapPrismaUserToEntity(user);
  }
  async verifyEmail(email: string, otp: string): Promise<User> {
    const user = await this.findByEmailAndOtp(email, otp);

    if (!user) {
      throw new BadRequestException("Invalid or expired verification OTP");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return this.mapPrismaUserToEntity(updatedUser);
  }

  async generateNewVerificationToken(email: string): Promise<string> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isEmailVerified) {
      throw new ConflictException("Email is already verified");
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    return verificationToken;
  }

  private mapPrismaUserToEntity(u: any): User {
    let maskedDirectors = u.directors;
    if (Array.isArray(u.directors)) {
      maskedDirectors = u.directors.map((d: any) => ({
        ...d,
        nin: d.nin ? d.nin.replace(/^\d{7}/, '*******') : null,
      }));
    }

    const plain = {
      ...u,
      directors: maskedDirectors,
      businessName: u.businessName ?? undefined,
      businessAddress: u.businessAddress ?? undefined,
      rcNumber: u.rcNumber ?? undefined,
      entityId: u.entityId ?? undefined,
      emailVerificationToken: u.emailVerificationToken ?? undefined,
      emailVerificationExpires: u.emailVerificationExpires ?? undefined,
    };
    return plainToInstance(User, plain);
  }
}
