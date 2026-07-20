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
import { CustomersService } from "./customers.service";
import { CreateCustomerDto, QueryCustomerDto, UpdateCustomerDto } from "./dtos";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators";

@ApiTags("Customers")
@ApiBearerAuth()
@Controller("api/v1/customers")
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a customer",
    description:
      "Creates a reusable customer master record scoped to the user's business.",
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({ status: 201, description: "Customer created" })
  @ApiResponse({ status: 409, description: "Duplicate TIN for this business" })
  async create(@CurrentUser() user: any, @Body() dto: CreateCustomerDto) {
    this.logger.log(`Creating customer '${dto.party_name}' for user ${user.id}`);
    return this.customersService.create(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "List customers",
    description: "Paginated, searchable list of the business's customers.",
  })
  @ApiResponse({ status: 200, description: "Customers retrieved" })
  async findAll(@CurrentUser() user: any, @Query() query: QueryCustomerDto) {
    return this.customersService.findAll(user, query);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get a customer by ID" })
  @ApiParam({ name: "id", description: "Customer UUID" })
  @ApiResponse({ status: 200, description: "Customer retrieved" })
  @ApiResponse({ status: 404, description: "Customer not found" })
  async findOne(@CurrentUser() user: any, @Param("id") id: string) {
    return this.customersService.findOne(user, id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a customer" })
  @ApiParam({ name: "id", description: "Customer UUID" })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ status: 200, description: "Customer updated" })
  @ApiResponse({ status: 404, description: "Customer not found" })
  async update(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(user, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Deactivate a customer",
    description:
      "Soft-deletes the customer. Historical invoices keep their snapshot of the customer.",
  })
  @ApiParam({ name: "id", description: "Customer UUID" })
  @ApiResponse({ status: 200, description: "Customer deactivated" })
  @ApiResponse({ status: 404, description: "Customer not found" })
  async remove(@CurrentUser() user: any, @Param("id") id: string) {
    return this.customersService.remove(user, id);
  }
}