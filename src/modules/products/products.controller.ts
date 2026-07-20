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
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto, QueryProductDto, UpdateProductDto } from "./dtos";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators";

@ApiTags("Products")
@ApiBearerAuth()
@Controller("api/v1/products")
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a product",
    description:
      "Creates a reusable product master record. Blank FIRS/tax fields are copied from the chosen category at creation.",
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: "Product created" })
  @ApiResponse({ status: 409, description: "Duplicate SKU for this business" })
  async create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    this.logger.log(`Creating product '${dto.name}' for user ${user.id}`);
    return this.productsService.create(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "List products",
    description: "Paginated, searchable list; filterable by category.",
  })
  @ApiResponse({ status: 200, description: "Products retrieved" })
  async findAll(@CurrentUser() user: any, @Query() query: QueryProductDto) {
    return this.productsService.findAll(user, query);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiParam({ name: "id", description: "Product UUID" })
  @ApiResponse({ status: 200, description: "Product retrieved" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async findOne(@CurrentUser() user: any, @Param("id") id: string) {
    return this.productsService.findOne(user, id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a product" })
  @ApiParam({ name: "id", description: "Product UUID" })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: "Product updated" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async update(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Deactivate a product",
    description:
      "Soft-deletes the product. Historical invoice lines keep their snapshot; their product link is nulled.",
  })
  @ApiParam({ name: "id", description: "Product UUID" })
  @ApiResponse({ status: 200, description: "Product deactivated" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async remove(@CurrentUser() user: any, @Param("id") id: string) {
    return this.productsService.remove(user, id);
  }
}