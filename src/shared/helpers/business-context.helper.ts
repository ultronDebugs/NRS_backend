import {
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database";

export interface RequestUser {
  id: number;
  role?: string;
}

/**
 * Resolves the business a request should operate on.
 *
 * - If `providedBusinessId` is given, verifies the user owns it (ADMIN bypasses).
 * - Otherwise defaults to the user's first business — the same behaviour used by
 *   invoice creation ({@link ../../modules/invoice/invoice.service}).
 *
 * Throws BadRequestException when the user has no business yet.
 */
export async function resolveBusinessId(
  prisma: PrismaService,
  user: RequestUser,
  providedBusinessId?: string,
): Promise<string> {
  if (providedBusinessId) {
    const business = await prisma.business.findUnique({
      where: { id: providedBusinessId },
      include: { entity: true },
    });

    if (!business) {
      throw new BadRequestException("Business not found");
    }

    if (user.role !== "ADMIN" && business.entity.userId !== user.id) {
      throw new ForbiddenException("You do not have access to this business");
    }

    return providedBusinessId;
  }

  const userWithEntity = await prisma.user.findUnique({
    where: { id: user.id },
    include: { entity: { include: { businesses: true } } },
  });

  const businesses = userWithEntity?.entity?.businesses ?? [];
  if (businesses.length === 0) {
    throw new BadRequestException(
      "No business found for user. Complete your business profile before managing customers or products.",
    );
  }

  return businesses[0].id;
}