import {
  BadRequestException,
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
import { CreateProductDto, QueryProductDto, UpdateProductDto } from "./dtos";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(user: RequestUser, dto: CreateProductDto) {
    const businessId = await resolveBusinessId(
      this.prisma,
      user,
      dto.business_id,
    );

    // Copy-on-create: blank FIRS/tax fields inherit from the category snapshot.
    const category = dto.category_id
      ? await this.loadOwnedCategory(user, dto.category_id, businessId)
      : null;

    try {
      return await this.prisma.product.create({
        data: {
          businessId,
          userId: user.id,
          categoryId: category?.id ?? null,
          type: dto.type ?? category?.type ?? "GOOD",
          name: dto.name,
          description: dto.description,
          sku: dto.sku,
          hsCode: dto.hs_code ?? category?.defaultHsCode ?? null,
          serviceCode: dto.service_code ?? category?.defaultServiceCode ?? null,
          productCategory:
            dto.product_category ?? category?.defaultProductCategory ?? null,
          defaultUnitPrice: dto.default_unit_price,
          priceUnit: dto.price_unit ?? "C62",
          taxCategory:
            dto.tax_category ?? category?.defaultTaxCategory ?? "STANDARD_VAT",
          taxRate: dto.tax_rate ?? category?.defaultTaxRate ?? 7.5,
          sellersItemIdentification: dto.sellers_item_identification,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          `A product with SKU '${dto.sku}' already exists for this business`,
        );
      }
      throw error;
    }
  }

  async findAll(user: RequestUser, query: QueryProductDto) {
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

    const where: Prisma.ProductWhereInput = {
      businessId,
      ...(includeInactive ? {} : { isActive: true }),
      ...(query.category_id ? { categoryId: query.category_id } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { sku: { contains: query.search, mode: "insensitive" } },
              {
                productCategory: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  async findOne(user: RequestUser, id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException("Product not found");
    }
    this.ensureOwnership(product, user);
    return product;
  }

  async update(user: RequestUser, id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || !existing.isActive) {
      throw new NotFoundException("Product not found");
    }
    this.ensureOwnership(existing, user);

    // Changing the category does NOT re-copy defaults (copy-on-create only).
    if (dto.category_id) {
      await this.loadOwnedCategory(user, dto.category_id, existing.businessId);
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          categoryId: dto.category_id,
          type: dto.type,
          name: dto.name,
          description: dto.description,
          sku: dto.sku,
          hsCode: dto.hs_code,
          serviceCode: dto.service_code,
          productCategory: dto.product_category,
          defaultUnitPrice: dto.default_unit_price,
          priceUnit: dto.price_unit,
          taxCategory: dto.tax_category,
          taxRate: dto.tax_rate,
          sellersItemIdentification: dto.sellers_item_identification,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A product with this SKU already exists for this business",
        );
      }
      throw error;
    }
  }

  /** Soft-delete. Invoice lines keep their frozen snapshot; the FK nulls out. */
  async remove(user: RequestUser, id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || !existing.isActive) {
      throw new NotFoundException("Product not found");
    }
    this.ensureOwnership(existing, user);

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: "Product deactivated" };
  }

  private async loadOwnedCategory(
    user: RequestUser,
    categoryId: string,
    businessId: string,
  ) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category || !category.isActive) {
      throw new NotFoundException("Category not found");
    }
    if (user.role !== "ADMIN" && category.userId !== user.id) {
      throw new ForbiddenException("You do not have access to this category");
    }
    if (category.businessId !== businessId) {
      throw new BadRequestException(
        "Category belongs to a different business than the product",
      );
    }
    return category;
  }

  private ensureOwnership(product: { userId: number }, user: RequestUser) {
    if (user.role === "ADMIN") return;
    if (product.userId !== user.id) {
      throw new ForbiddenException(
        "You do not have permission to access this product",
      );
    }
  }
}