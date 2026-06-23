import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Logger,
  Query,
  ParseIntPipe,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { InvoiceService } from "./invoice.service";
import {
  GetEntityDto,
  ValidateIrnDto,
  ValidateInvoiceDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from "./dtos";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentUser, Public } from "../../common/decorators";

@ApiTags("Invoice")
@ApiBearerAuth()
@Controller("api/v1/invoice")
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name);

  constructor(private readonly invoiceService: InvoiceService) {}

  private async ensureInvoiceOwnership(invoiceId: number, user: any) {
    if (user.role === "ADMIN") return;
    const invoice = await this.invoiceService.getInvoiceById(invoiceId);
    if (!invoice || invoice.userId !== user.id) {
      throw new UnauthorizedException("You do not have permission to access this invoice");
    }
  }

  /**
   * Retrieves entity information by entity ID from the FIRS API.
   * @param entityId - The unique identifier of the entity to retrieve.
   * @returns The entity information from the FIRS API.
   */
  @Get("entity/:entityId")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Get entity by ID",
    description: "Retrieves entity information by entity ID from the FIRS API",
  })
  @ApiParam({
    name: "entityId",
    description: "The unique identifier of the entity",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Entity information retrieved successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid entity ID provided",
  })
  @ApiResponse({
    status: 404,
    description: "Entity not found",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async getEntityById(
    @CurrentUser() user: any,
    @Param() params: GetEntityDto
  ): Promise<any> {
    this.logger.log(
      `Received request to get entity with ID: ${params.entityId}`,
    );

    if (user.entityId !== params.entityId && user.role !== "ADMIN") {
      throw new UnauthorizedException("You do not have permission to view this entity data");
    }

    try {
      const entity = await this.invoiceService.getEntityById(params.entityId);
      this.logger.log(
        `Successfully retrieved entity with ID: ${params.entityId}`,
      );
      return entity;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve entity with ID: ${params.entityId}`,
        error.stack,
      );
      throw error;
    }
  }

  // /**
  //  * Validates an IRN (Invoice Reference Number) using the FIRS API.
  //  * @param payload - The payload containing invoice reference, business ID, and IRN.
  //  * @returns The validation result from the FIRS API.
  //  */
  // @Public()
  // @Post('irn/validate')
  // @HttpCode(HttpStatus.OK)
  // @UsePipes(new ValidationPipe({ transform: true }))
  // @ApiOperation({
  //   summary: 'Validate IRN',
  //   description: 'Validates an IRN (Invoice Reference Number) using the FIRS API',
  // })
  // @ApiBody({
  //   type: ValidateIrnDto,
  //   description: 'The payload containing invoice reference, business ID, and IRN',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'IRN validation completed successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       ok: {
  //         type: 'boolean',
  //         description: 'Whether the IRN validation was successful',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid payload provided',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Internal server error',
  // })
  // async validateIrn(@Body() payload: ValidateIrnDto): Promise<{ ok: boolean }> {
  //   this.logger.log(`Received IRN validation request for IRN: ${payload.irn}`);

  //   try {
  //     const result = await this.invoiceService.validateIrn(payload);
  //     this.logger.log(`Successfully validated IRN: ${payload.irn}`);
  //     return result;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to validate IRN: ${payload.irn}`,
  //       error.stack,
  //     );
  //     throw error;
  //   }
  // }

  // /**
  //  * Validates an invoice using the FIRS API.
  //  * @param payload - The invoice data to validate.
  //  * @returns The validation result from the FIRS API.
  //  */
  // @Public()
  // @Post('validate')
  // @HttpCode(HttpStatus.OK)
  // @UsePipes(new ValidationPipe({ transform: true }))
  // @ApiOperation({
  //   summary: 'Validate Invoice',
  //   description: 'Validates an invoice using the FIRS API',
  // })
  // @ApiBody({
  //   type: ValidateInvoiceDto,
  //   description: 'The invoice data to validate',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Invoice validation completed successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       ok: {
  //         type: 'boolean',
  //         description: 'Whether the invoice validation was successful',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid payload provided',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Internal server error',
  // })
  // async validateInvoice(@Body() payload: ValidateInvoiceDto): Promise<{ ok: boolean }> {
  //   this.logger.log(`Received invoice validation request for IRN: ${payload.irn}`);

  //   try {
  //     const result = await this.invoiceService.validateInvoice(payload);
  //     this.logger.log(`Successfully validated invoice with IRN: ${payload.irn}`);
  //     return result;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to validate invoice with IRN: ${payload.irn}`,
  //       error.stack,
  //     );
  //     throw error;
  //   }
  // }

  // /**
  //  * Signs an invoice using the FIRS API.
  //  * @param payload - The invoice data to sign.
  //  * @returns The signing result from the FIRS API.
  //  */
  // @Public()
  // @Post('sign')
  // @HttpCode(HttpStatus.OK)
  // @UsePipes(new ValidationPipe({ transform: true }))
  // @ApiOperation({
  //   summary: 'Sign Invoice',
  //   description: 'Signs an invoice using the FIRS API',
  // })
  // @ApiBody({
  //   type: ValidateInvoiceDto,
  //   description: 'The invoice data to sign',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Invoice signing completed successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       ok: {
  //         type: 'boolean',
  //         description: 'Whether the invoice signing was successful',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid payload provided',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Internal server error',
  // })
  // async signInvoice(@Body() payload: ValidateInvoiceDto): Promise<{ ok: boolean }> {
  //   this.logger.log(`Received invoice signing request for IRN: ${payload.irn}`);

  //   try {
  //     const result = await this.invoiceService.signInvoice(payload);
  //     this.logger.log(`Successfully signed invoice with IRN: ${payload.irn}`);
  //     return result;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to sign invoice with IRN: ${payload.irn}`,
  //       error.stack,
  //     );
  //     throw error;
  //   }
  // }

  // /**
  //  * Gets invoice confirmation details by IRN from the FIRS API.
  //  * @param irn - The Invoice Reference Number to confirm.
  //  * @returns The confirmation details of the invoice.
  //  */
  // @Public()
  // @Get('confirm/:irn')
  // @HttpCode(HttpStatus.OK)
  // @UsePipes(new ValidationPipe({ transform: true }))
  // @ApiOperation({
  //   summary: 'Get Invoice Confirmation',
  //   description: 'Gets invoice confirmation details by IRN from the FIRS API',
  // })
  // @ApiParam({
  //   name: 'irn',
  //   description: 'The Invoice Reference Number to confirm',
  //   example: 'ITW20853450-6997D6BB-20240703',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Invoice confirmation details retrieved successfully',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid IRN provided',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Invoice not found',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Internal server error',
  // })
  // async getInvoiceConfirmation(@Param('irn') irn: string): Promise<any> {
  //   this.logger.log(`Received request to get invoice confirmation for IRN: ${irn}`);

  //   try {
  //     const confirmation = await this.invoiceService.getInvoiceConfirmation(irn);
  //     this.logger.log(`Successfully retrieved invoice confirmation for IRN: ${irn}`);
  //     return confirmation;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to retrieve invoice confirmation for IRN: ${irn}`,
  //       error.stack,
  //     );
  //     throw error;
  //   }
  // }

  // --- Exchange E-Invoice Transmit APIs ---

  /**
   * Self health check for transmit readiness.
   */
  @Public()
  @Get("transmit/self-health-check")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Transmit self health check",
    description:
      "Confirms setup and readiness for transmission. Sends test notification to validate connection and API key.",
  })
  @ApiResponse({ status: 200, description: "Health check result" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async transmitSelfHealthCheck(): Promise<any> {
    this.logger.log("Received transmit self health check request");
    try {
      const result = await this.invoiceService.transmitSelfHealthCheck();
      this.logger.log("Transmit self health check completed");
      return result;
    } catch (error) {
      this.logger.error("Transmit self health check failed", error.stack);
      throw error;
    }
  }

  /**
   * Lookup by TIN (must be before :id routes to avoid path conflict).
   */
  @Get("transmit/lookup/tin/:tin")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Transmit lookup TIN",
    description: "Retrieves invoice and involved parties details by TIN",
  })
  @ApiParam({ name: "tin", description: "Tax Identification Number" })
  @ApiResponse({ status: 200, description: "TIN lookup result" })
  @ApiResponse({ status: 404, description: "Not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async transmitLookupTin(@Param("tin") tin: string): Promise<any> {
    this.logger.log(`Received transmit lookup TIN request: ${tin}`);
    try {
      const result = await this.invoiceService.transmitLookupTin(tin);
      this.logger.log(`Transmit lookup TIN completed: ${tin}`);
      return result;
    } catch (error) {
      this.logger.error(`Transmit lookup TIN failed: ${tin}`, error.stack);
      throw error;
    }
  }

  /**
   * Pull invoice - retrieves invoices in transit and updates status to TRANSMITTING.
   */
  @Get("transmit/pull")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Transmit pull invoice",
    description:
      "Retrieves invoices in transit. Updates local invoice status to TRANSMITTING.",
  })
  @ApiResponse({ status: 200, description: "Pull result with invoices" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async transmitPullInvoice(): Promise<any> {
    this.logger.log("Received transmit pull invoice request");
    try {
      const result = await this.invoiceService.transmitPullInvoice();
      this.logger.log("Transmit pull invoice completed");
      return result;
    } catch (error) {
      this.logger.error("Transmit pull invoice failed", error.stack);
      throw error;
    }
  }

  /**
   * Lookup invoice by ID - retrieves details about the invoice and involved parties.
   */
  @Get(":id/transmit/lookup")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Transmit lookup by invoice ID",
    description: "Retrieves invoice and involved parties details by invoice ID",
  })
  @ApiParam({ name: "id", description: "Invoice ID", example: 1 })
  @ApiResponse({ status: 200, description: "Invoice lookup result" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async transmitLookupById(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) invoiceId: number,
  ): Promise<any> {
    this.logger.log(
      `Received transmit lookup request for invoice ID: ${invoiceId}`,
    );
    await this.ensureInvoiceOwnership(invoiceId, user);
    try {
      const result = await this.invoiceService.transmitLookupIrnById(invoiceId);
      this.logger.log(`Transmit lookup completed for invoice ID: ${invoiceId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Transmit lookup failed for invoice ID: ${invoiceId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Transmit invoice by ID - sends webhook notification to involved parties.
   */
  @Post(":id/transmit")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Transmit invoice by ID",
    description:
      "Sends webhook notification to all involved parties about invoice transmission.",
  })
  @ApiParam({ name: "id", description: "Invoice ID", example: 1 })
  @ApiResponse({ status: 200, description: "Transmit result" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiResponse({
    status: 503,
    description: "Transmission temporarily unavailable; retry later",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async transmitInvoiceById(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) invoiceId: number,
  ): Promise<any> {
    this.logger.log(`Received transmit invoice request for ID: ${invoiceId}`);
    await this.ensureInvoiceOwnership(invoiceId, user);
    try {
      const result = await this.invoiceService.transmitInvoiceById(invoiceId);
      this.logger.log(`Transmit invoice completed for ID: ${invoiceId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Transmit invoice failed for ID: ${invoiceId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Retry invoice transmission by ID.
   */
  @Post(":id/transmit/retry")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Retry transmit invoice by ID",
    description:
      "Retries invoice transmission after a retryable upstream failure such as offline access points.",
  })
  @ApiParam({ name: "id", description: "Invoice ID", example: 1 })
  @ApiResponse({ status: 200, description: "Transmit retry result" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiResponse({
    status: 503,
    description: "Transmission temporarily unavailable; retry later",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async retryTransmitInvoiceById(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) invoiceId: number,
  ): Promise<any> {
    this.logger.log(`Received transmit retry request for ID: ${invoiceId}`);
    await this.ensureInvoiceOwnership(invoiceId, user);
    try {
      const result =
        await this.invoiceService.retryTransmitInvoiceById(invoiceId);
      this.logger.log(`Transmit retry completed for ID: ${invoiceId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Transmit retry failed for ID: ${invoiceId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Confirm receipt of transmitted invoice by ID.
   */
  @Patch(":id/transmit/confirm")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Transmit confirm receipt by invoice ID",
    description:
      "Acknowledges receipt of transmitted invoice. Invoice is completely transmitted when all parties acknowledge.",
  })
  @ApiParam({ name: "id", description: "Invoice ID", example: 1 })
  @ApiResponse({ status: 200, description: "Confirm receipt result" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async transmitConfirmReceiptById(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) invoiceId: number,
  ): Promise<any> {
    this.logger.log(
      `Received transmit confirm receipt request for ID: ${invoiceId}`,
    );
    await this.ensureInvoiceOwnership(invoiceId, user);
    try {
      const result =
        await this.invoiceService.transmitConfirmReceiptById(invoiceId);
      this.logger.log(
        `Transmit confirm receipt completed for ID: ${invoiceId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Transmit confirm receipt failed for ID: ${invoiceId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Creates a new invoice after validating with FIRS API and saves it to the database.
   * @param payload - The invoice data to create.
   * @returns The created invoice.
   */
  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Create Invoice",
    description:
      "Validates invoice with FIRS API and creates a new invoice in the database",
  })
  @ApiBody({
    type: CreateInvoiceDto,
    description: "The invoice data to create",
  })
  @ApiResponse({
    status: 201,
    description: "Invoice created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid payload provided or invoice validation failed",
  })
  @ApiResponse({
    status: 409,
    description: "Invoice with this IRN already exists",
  })
  @ApiResponse({
    status: 422,
    description:
      "Invoice validation failed - invoice data is invalid according to FIRS API",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error or FIRS API error",
  })
  async createInvoice(
    @CurrentUser() user: any,
    @Body() payload: CreateInvoiceDto,
  ): Promise<any> {
    this.logger.log(
      `Received invoice creation request for IRN: ${payload.irn}`,
    );

    try {
      const invoice = await this.invoiceService.createInvoice(payload, user.id);
      this.logger.log(
        `Successfully created invoice with IRN: ${payload.irn} and ID: ${invoice.id}`,
      );
      return invoice;
    } catch (error) {
      this.logger.error(
        `Failed to create invoice with IRN: ${payload.irn}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Gets all invoices for the authenticated user with pagination.
   * @param user - The authenticated user from JWT token.
   * @param page - The page number (1-based).
   * @param limit - The number of invoices per page.
   * @returns Paginated invoices for the authenticated user.
   */
  @Get("my-invoices")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Get authenticated user invoices with pagination",
    description: "Gets all invoices for the authenticated user with pagination",
  })
  @ApiResponse({
    status: 200,
    description: "User invoices retrieved successfully",
    schema: {
      type: "object",
      properties: {
        invoices: {
          type: "array",
          description: "Array of invoices",
        },
        total: {
          type: "number",
          description: "Total number of invoices",
        },
        page: {
          type: "number",
          description: "Current page number",
        },
        limit: {
          type: "number",
          description: "Number of invoices per page",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid pagination parameters",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing JWT token",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async getMyInvoices(
    @CurrentUser() user: any,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<{ invoices: any[]; total: number; page: number; limit: number }> {
    this.logger.log(
      `Received request to get invoices for authenticated user ID: ${user.id}, page: ${page}, limit: ${limit}`,
    );

    try {
      const result = await this.invoiceService.getInvoicesByUserId(
        user.id,
        page,
        limit,
      );
      this.logger.log(
        `Successfully retrieved ${result.invoices.length} invoices for user ID: ${user.id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve invoices for user ID: ${user.id}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Gets a single invoice by ID.
   * @param invoiceId - The invoice ID to retrieve.
   * @returns The invoice with all related data.
   */
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Get invoice by ID",
    description: "Gets a single invoice by ID with all related data",
  })
  @ApiParam({
    name: "id",
    description: "The invoice ID to retrieve",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Invoice retrieved successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid invoice ID provided",
  })
  @ApiResponse({
    status: 404,
    description: "Invoice not found",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async getInvoiceById(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) invoiceId: number,
  ): Promise<any> {
    this.logger.log(`Received request to get invoice with ID: ${invoiceId}`);
    await this.ensureInvoiceOwnership(invoiceId, user);

    try {
      const invoice = await this.invoiceService.getInvoiceById(invoiceId);
      this.logger.log(`Successfully retrieved invoice with ID: ${invoiceId}`);
      return invoice;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve invoice with ID: ${invoiceId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Signs an invoice by ID and updates its status.
   * @param invoiceId - The invoice ID to sign.
   * @returns The signing result and updated invoice.
   */
  @Post(":id/sign")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Sign invoice by ID",
    description:
      "Signs an invoice by ID using the FIRS API and updates its status to SIGNED",
  })
  @ApiParam({
    name: "id",
    description: "The invoice ID to sign",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Invoice signed successfully",
    schema: {
      type: "object",
      properties: {
        ok: {
          type: "boolean",
          description: "Whether the invoice signing was successful",
        },
        invoice: {
          type: "object",
          description: "The updated invoice",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid invoice ID provided",
  })
  @ApiResponse({
    status: 404,
    description: "Invoice not found",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async signInvoiceById(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) invoiceId: number,
  ): Promise<{ ok: boolean; invoice: any }> {
    this.logger.log(`Received request to sign invoice with ID: ${invoiceId}`);
    await this.ensureInvoiceOwnership(invoiceId, user);

    try {
      const result = await this.invoiceService.signInvoiceById(invoiceId);
      this.logger.log(`Successfully signed invoice with ID: ${invoiceId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to sign invoice with ID: ${invoiceId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Confirms an invoice by ID and updates its status.
   * @param invoiceId - The invoice ID to confirm.
   * @returns The confirmation result and updated invoice.
   */
  @Post(":id/confirm")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Confirm invoice by ID",
    description:
      "Confirms an invoice by ID using the FIRS API and updates its status to CONFIRMED",
  })
  @ApiParam({
    name: "id",
    description: "The invoice ID to confirm",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Invoice confirmed successfully",
    schema: {
      type: "object",
      properties: {
        ok: {
          type: "boolean",
          description: "Whether the invoice confirmation was successful",
        },
        invoice: {
          type: "object",
          description: "The updated invoice",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid invoice ID provided",
  })
  @ApiResponse({
    status: 404,
    description: "Invoice not found",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async confirmInvoiceById(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) invoiceId: number,
  ): Promise<{ ok: boolean; invoice: any }> {
    this.logger.log(
      `Received request to confirm invoice with ID: ${invoiceId}`,
    );
    await this.ensureInvoiceOwnership(invoiceId, user);

    try {
      const result = await this.invoiceService.confirmInvoiceById(invoiceId);
      this.logger.log(`Successfully confirmed invoice with ID: ${invoiceId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to confirm invoice with ID: ${invoiceId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Updates an invoice by ID and calls FIRS API to update the invoice.
   * @param invoiceId - The invoice ID to update.
   * @param payload - The invoice data to update.
   * @returns The updated invoice.
   */
  @Post(":id/update")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Update invoice by ID",
    description:
      "Updates an invoice by ID and calls FIRS API to update the invoice",
  })
  @ApiParam({
    name: "id",
    description: "The invoice ID to update",
    example: 1,
  })
  @ApiBody({
    type: UpdateInvoiceDto,
    description: "The invoice data to update",
  })
  @ApiResponse({
    status: 200,
    description: "Invoice updated successfully",
    schema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The updated invoice ID",
        },
        irn: {
          type: "string",
          description: "The invoice reference number",
        },
        status: {
          type: "string",
          description: "The invoice status",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          description: "The update timestamp",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid invoice ID or payload provided",
  })
  @ApiResponse({
    status: 404,
    description: "Invoice not found",
  })
  @ApiResponse({
    status: 409,
    description: "Invoice cannot be updated due to current status",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error or FIRS API error",
  })
  async updateInvoiceById(
    @Param("id", ParseIntPipe) invoiceId: number,
    @Body() payload: UpdateInvoiceDto,
  ): Promise<any> {
    this.logger.log(`Received request to update invoice with ID: ${invoiceId}`);

    try {
      const updatedInvoice = await this.invoiceService.updateInvoiceById(
        invoiceId,
        payload,
      );
      this.logger.log(`Successfully updated invoice with ID: ${invoiceId}`);
      return updatedInvoice;
    } catch (error) {
      this.logger.error(
        `Failed to update invoice with ID: ${invoiceId}`,
        error.stack,
      );
      throw error;
    }
  }
}
