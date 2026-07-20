import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ProductCategoriesService } from "./product-categories.service";
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "./dtos";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators";

@ApiTags("Product Categories")
@ApiBearerAuth()
@Controller("api/v1/product-categories")
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ProductCategoriesController {
  private readonly logger = new Logger(ProductCategoriesController.name);

  constructor(
    private readonly categoriesService: ProductCategoriesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a product category",
    description:
      "Categories group products and hold default FIRS/tax fields that products inherit at creation.",
  })
  @ApiBody({ type: CreateProductCategoryDto })
  @ApiResponse({ status: 201, description: "Category created" })
  @ApiResponse({ status: 409, description: "Duplicate name for this business" })
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateProductCategoryDto,
  ) {
    this.logger.log(`Creating category '${dto.name}' for user ${user.id}`);
    return this.categoriesService.create(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "List product categories",
    description: "Returns all active categories with a product count each.",
  })
  @ApiQuery({ name: "business_id", required: false })
  @ApiResponse({ status: 200, description: "Categories retrieved" })
  async findAll(
    @CurrentUser() user: any,
    @Query("business_id") businessId?: string,
  ) {
    return this.categoriesService.findAll(user, businessId);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get a category by ID" })
  @ApiParam({ name: "id", description: "Category UUID" })
  @ApiResponse({ status: 200, description: "Category retrieved" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async findOne(@CurrentUser() user: any, @Param("id") id: string) {
    return this.categoriesService.findOne(user, id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update a category",
    description:
      "Updating default fields does NOT back-fill existing products (copy-on-create).",
  })
  @ApiParam({ name: "id", description: "Category UUID" })
  @ApiBody({ type: UpdateProductCategoryDto })
  @ApiResponse({ status: 200, description: "Category updated" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async update(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    return this.categoriesService.update(user, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Deactivate a category",
    description:
      "Blocks deletion when active products reference it. Pass reassignTo=<categoryId> to move them, or reassignTo=null to uncategorise.",
  })
  @ApiParam({ name: "id", description: "Category UUID" })
  @ApiQuery({
    name: "reassignTo",
    required: false,
    description: "Target category UUID, or the literal 'null' to uncategorise",
  })
  @ApiResponse({ status: 200, description: "Category deactivated" })
  @ApiResponse({
    status: 409,
    description: "Category still has active products and no reassignTo given",
  })
  async remove(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Query("reassignTo") reassignTo?: string,
  ) {
    // Distinguish "not provided" (block) from "null" (uncategorise) from an id.
    const reassign =
      reassignTo === undefined
        ? undefined
        : reassignTo === "null" || reassignTo === ""
          ? null
          : reassignTo;
    return this.categoriesService.remove(user, id, reassign);
  }
}