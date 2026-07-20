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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../database");
const mail_service_1 = require("../../shared/email/mail.service");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("./entities/user.entity");
const crypto = require("crypto");
const class_transformer_1 = require("class-transformer");
let UsersService = class UsersService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async createUser(createUserDto) {
        const existingUserByEmail = await this.prisma.user.findUnique({
            where: {
                email: createUserDto.email,
            },
        });
        if (existingUserByEmail) {
            throw new common_1.ConflictException("User with this email already exists");
        }
        const randomPassword = crypto.randomBytes(12).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
                role: createUserDto.role,
                isEmailVerified: false,
                isProfileComplete: false,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
            },
        });
        return {
            success: true,
            user: this.mapPrismaUserToEntity(user),
            password: randomPassword,
        };
    }
    async createUserLightweight(registerUserDto) {
        const existingUserByEmail = await this.prisma.user.findUnique({
            where: {
                email: registerUserDto.email,
            },
        });
        if (existingUserByEmail) {
            throw new common_1.ConflictException("User with this email already exists");
        }
        const role = registerUserDto.role ?? "USER";
        if (!["USER", "CLIENT"].includes(role)) {
            throw new common_1.BadRequestException("Only USER or CLIENT can self-register");
        }
        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await this.prisma.user.create({
            data: {
                email: registerUserDto.email,
                password: hashedPassword,
                role: role,
                isEmailVerified: false,
                isProfileComplete: false,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
            },
        });
        return this.mapPrismaUserToEntity(user);
    }
    async completeProfile(userId, completeProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        if (completeProfileDto.entityId) {
            const existingEntity = await this.prisma.user.findUnique({
                where: { entityId: completeProfileDto.entityId },
            });
            if (existingEntity && existingEntity.id !== userId) {
                throw new common_1.ConflictException("This entity ID is already in use");
            }
        }
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
    async findAllUsers() {
        const users = await this.prisma.user.findMany({
            where: { isActive: true },
        });
        return users.map(({ password, ...user }) => user);
    }
    async findUserById(id) {
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
    }
    async findUserByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return null;
        }
        return this.mapPrismaUserToEntity(user);
    }
    async updateUser(id, updateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException("User not found");
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...updateUserDto,
                role: updateUserDto.role,
            },
        });
        return updatedUser;
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async findByEmailAndOtp(email, otp) {
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
    async verifyEmail(email, otp) {
        const user = await this.findByEmailAndOtp(email, otp);
        if (!user) {
            throw new common_1.BadRequestException("Invalid or expired verification OTP");
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
    async generateNewVerificationToken(email) {
        const user = await this.findUserByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        if (user.isEmailVerified) {
            throw new common_1.ConflictException("Email is already verified");
        }
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
            },
        });
        return verificationToken;
    }
    mapPrismaUserToEntity(u) {
        let maskedDirectors = u.directors;
        if (Array.isArray(u.directors)) {
            maskedDirectors = u.directors.map((d) => ({
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
        return (0, class_transformer_1.plainToInstance)(user_entity_1.User, plain);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService,
        mail_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map