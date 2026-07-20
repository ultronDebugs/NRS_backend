export interface JwtPayload {
    sub: number;
    email: string;
    entityId: string;
    businessName: string;
    role?: string;
    iat?: number;
    exp?: number;
}
