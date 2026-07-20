export declare class User {
    id: number;
    entityId?: string;
    email: string;
    password: string;
    businessName?: string;
    businessAddress?: string;
    rcNumber?: string;
    role: any;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    isProfileComplete: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    directors?: any[];
}
