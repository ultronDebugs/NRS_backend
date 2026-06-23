// src/modules/users/entities/user.entity.ts
import { Exclude } from "class-transformer";

export class User {
  id: number;
  entityId?: string;
  email: string;
  
  @Exclude({ toPlainOnly: true })
  password: string;
  
  businessName?: string;
  businessAddress?: string;
  rcNumber?: string;
  role: any; // Using any to avoid type conflicts with Prisma's Role enum
  isEmailVerified: boolean;
  
  @Exclude({ toPlainOnly: true })
  emailVerificationToken?: string;
  
  emailVerificationExpires?: Date;
  isProfileComplete: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  directors?: any[];
}
