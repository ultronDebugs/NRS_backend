import { CanActivate, ExecutionContext } from "@nestjs/common";
import { PrismaService } from "../../../database";
export declare class ApiKeyAuthGuard implements CanActivate {
    private readonly prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
