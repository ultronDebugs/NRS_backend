import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { RegisterUserDto, CompleteProfileDto } from "../users/dtos";
import { LoginDto, ResendVerificationDto, VerifyEmailDto, ResetPasswordDto } from "./dtos";
import { EmailService } from "../../shared/email/mail.service";
import { PrismaService } from "../../database";
export declare class AuthService {
    private userService;
    private jwtService;
    private emailService;
    private prisma;
    private readonly logger;
    private readonly firsApiUrl;
    private readonly firsApiKey;
    private readonly firsApiSecret;
    constructor(userService: UsersService, jwtService: JwtService, emailService: EmailService, prisma: PrismaService);
    private buildBusinessContext;
    private sanitizeUserProfile;
    private extractIrnTemplate;
    register(registerUserDto: RegisterUserDto): Promise<{
        message: string;
    }>;
    completeProfile(userId: number, completeProfileDto: CompleteProfileDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            businessName: string | undefined;
            role: any;
            isEmailVerified: boolean;
        };
        isEmailVerified: boolean;
        isProfileComplete: boolean;
        entity_id: string | null;
        business_id: string | null;
        businesses: {
            business_id: string;
            name: string;
            tin: string;
            is_active: boolean;
        }[];
        directors: any;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            role: any;
            isEmailVerified: boolean;
            businessName?: undefined;
        };
        isEmailVerified: boolean;
        isProfileComplete: boolean;
        entity_id: null;
        business_id: null;
        businesses: never[];
        message: string;
    } | {
        access_token: string;
        user: {
            id: number;
            email: string;
            businessName: string | undefined;
            role: any;
            isEmailVerified: true;
        };
        isEmailVerified: true;
        isProfileComplete: boolean;
        entity_id: string | null;
        business_id: string | null;
        businesses: {
            business_id: string;
            name: string;
            tin: string;
            is_active: boolean;
        }[];
        message?: undefined;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<import("../users/entities/user.entity").User>;
    resendVerification(resendVerificationDto: ResendVerificationDto): Promise<{
        message: string;
    }>;
    validateUser(payload: any): Promise<import("../users/entities/user.entity").User | null>;
    getProfile(userId: number): Promise<any>;
    syncEntityBusinesses(userId: number): Promise<any>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    fetchAndSaveEntityData(entityId: string, userId: number, dto?: CompleteProfileDto): Promise<any>;
}
