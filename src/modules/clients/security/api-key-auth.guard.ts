import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../../database";
import * as bcrypt from "bcryptjs";

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey: string | undefined = request.headers["x-client-key"];
    const apiSecret: string | undefined = request.headers["x-client-secret"];

    if (!apiKey || !apiSecret) {
      throw new UnauthorizedException("Missing client API credentials");
    }

    // Look up by apiKey only, then bcrypt.compare the secret
    const cred = await this.prisma.clientApiCredential.findFirst({
      where: { apiKey, isActive: true },
      include: { user: true },
    });

    if (!cred) {
      throw new UnauthorizedException("Invalid client API credentials");
    }

    const secretValid = await bcrypt.compare(apiSecret, cred.apiSecret);
    if (!secretValid) {
      throw new UnauthorizedException("Invalid client API credentials");
    }

    if (cred.user.role !== "CLIENT") {
      throw new ForbiddenException("Only clients may access this resource");
    }

    request.user = { id: cred.userId };
    return true;
  }
}
