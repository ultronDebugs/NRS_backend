import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../database";
import {
  resolveBusinessId,
  RequestUser,
} from "../../shared/helpers/business-context.helper";
import { CreateCustomerDto, QueryCustomerDto, UpdateCustomerDto } from "./dtos";

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(user: RequestUser, dto: CreateCustomerDto) {
    const businessId = await resolveBusinessId(
      this.prisma,
      user,
      dto.business_id,
    );

    try {
      return await this.prisma.customer.create({
        data: {
          businessId,
          userId: user.id,
          partyName: dto.party_name,
          tin: dto.tin,
          email: dto.email,
          telephone: dto.telephone,
          businessDescription: dto.business_description,
          streetName: dto.postal_address.street_name,
          cityName: dto.postal_address.city_name,
          postalZone: dto.postal_address.postal_zone,
          country: dto.postal_address.country ?? "NG",
          lga: dto.postal_address.lga,
          state: dto.postal_address.state,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          `A customer with TIN ${dto.tin} already exists for this business`,
        );
      }
      throw error;
    }
  }

  async findAll(user: RequestUser, query: QueryCustomerDto) {
    const businessId = await resolveBusinessId(
      this.prisma,
      user,
      query.business_id,
    );

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const includeInactive =
      query.include_inactive === true ||
      (query.include_inactive as unknown) === "true";

    const where: Prisma.CustomerWhereInput = {
      businessId,
      ...(includeInactive ? {} : { isActive: true }),
      ...(query.search
        ? {
            OR: [
              { partyName: { contains: query.search, mode: "insensitive" } },
              { tin: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [customers, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { customers, total, page, limit };
  }

  async findOne(user: RequestUser, id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer || !customer.isActive) {
      throw new NotFoundException("Customer not found");
    }
    this.ensureOwnership(customer, user);
    return customer;
  }

  async update(user: RequestUser, id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing || !existing.isActive) {
      throw new NotFoundException("Customer not found");
    }
    this.ensureOwnership(existing, user);

    try {
      return await this.prisma.customer.update({
        where: { id },
        data: {
          partyName: dto.party_name,
          tin: dto.tin,
          email: dto.email,
          telephone: dto.telephone,
          businessDescription: dto.business_description,
          streetName: dto.postal_address?.street_name,
          cityName: dto.postal_address?.city_name,
          postalZone: dto.postal_address?.postal_zone,
          country: dto.postal_address?.country,
          lga: dto.postal_address?.lga,
          state: dto.postal_address?.state,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A customer with this TIN already exists for this business",
        );
      }
      throw error;
    }
  }

  /** Soft-delete: flips isActive. Historical invoices already hold a snapshot. */
  async remove(user: RequestUser, id: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing || !existing.isActive) {
      throw new NotFoundException("Customer not found");
    }
    this.ensureOwnership(existing, user);

    await this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: "Customer deactivated" };
  }

  private ensureOwnership(customer: { userId: number }, user: RequestUser) {
    if (user.role === "ADMIN") return;
    if (customer.userId !== user.id) {
      throw new ForbiddenException(
        "You do not have permission to access this customer",
      );
    }
  }
}