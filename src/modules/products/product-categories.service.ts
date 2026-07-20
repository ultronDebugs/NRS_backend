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
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "./dtos";

@Injectable()
export class ProductCategoriesService {
  private readonly logger = new Logger(ProductCategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(user: RequestUser, dto: CreateProductCategoryDto) {
    const businessId = await resolveBusinessId(
      this.prisma,
      user,
      dto.business_id,
    );

    try {
      return await this.prisma.productCategory.create({
        data: {
          businessId,
          userId: user.id,
          name: dto.name,
          description: dto.description,
          type: dto.type ?? "GOOD",
          defaultHsCode: dto.default_hs_code,
          defaultServiceCode: dto.default_service_code,
          defaultProductCategory: dto.default_product_category,
          defaultTaxCategory: dto.default_tax_category ?? "STANDARD_VAT",
          defaultTaxRate: dto.default_tax_rate ?? 7.5,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          `A category named '${dto.name}' already exists for this business`,
        );
      }
      throw error;
    }
  }

  async findAll(user: RequestUser, businessIdParam?: string) {
    const businessId = await resolveBusinessId(
      this.prisma,
      user,
      businessIdParam,
    );

    return this.prisma.productCategory.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }

  async findOne(user: RequestUser, id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category || !category.isActive) {
      throw new NotFoundException("Category not found");
    }
    this.ensureOwnership(category, user);
    return category;
  }

  async update(user: RequestUser, id: string, dto: UpdateProductCategoryDto) {
    const existing = await this.prisma.productCategory.findUnique({
      where: { id },
    });
    if (!existing || !existing.isActive) {
      throw new NotFoundException("Category not found");
    }
    this.ensureOwnership(existing, user);

    try {
      return await this.prisma.productCategory.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          type: dto.type,
          defaultHsCode: dto.default_hs_code,
          defaultServiceCode: dto.default_service_code,
          defaultProductCategory: dto.default_product_category,
          defaultTaxCategory: dto.default_tax_category,
          defaultTaxRate: dto.default_tax_rate,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A category with this name already exists for this business",
        );
      }
      throw error;
    }
  }

  /**
   * Soft-deletes a category. Blocks deletion when active products still
   * reference it, unless `reassignTo` points at another category (or null to
   * uncategorise them). No silent orphaning.
   */
  async remove(user: RequestUser, id: string, reassignTo?: string | null) {
    const existing = await this.prisma.productCategory.findUnique({
      where: { id },
    });
    if (!existing || !existing.isActive) {
      throw new NotFoundException("Category not found");
    }
    this.ensureOwnership(existing, user);

    const productCount = await this.prisma.product.count({
      where: { categoryId: id, isActive: true },
    });

    if (productCount > 0 && reassignTo === undefined) {
      throw new ConflictException(
        `Category has ${productCount} active product(s). Pass reassignTo=<categoryId> to move them, or reassignTo=null to uncategorise them.`,
      );
    }

    if (reassignTo) {
      const target = await this.prisma.productCategory.findUnique({
        where: { id: reassignTo },
      });
      if (!target || !target.isActive) {
        throw new NotFoundException("Target category for reassignment not found");
      }
      this.ensureOwnership(target, user);
      if (target.businessId !== existing.businessId) {
        throw new ForbiddenException(
          "Cannot reassign products to a category in another business",
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: reassignTo ?? null },
      }),
      this.prisma.productCategory.update({
        where: { id },
        data: { isActive: false },
      }),
    ]);

    return { message: "Category deactivated", productsReassigned: productCount };
  }

  private ensureOwnership(category: { userId: number }, user: RequestUser) {
    if (user.role === "ADMIN") return;
    if (category.userId !== user.id) {
      throw new ForbiddenException(
        "You do not have permission to access this category",
      );
    }
  }
}