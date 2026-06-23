import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { SystemIntegratorService } from "./system-integrator.service";
import { FirsValidateInvoiceDto } from "../firs/dtos/validete-invoice.dto";
import { GenerateQrCodeDto, UpdateFirsSettingsDto } from "./dtos";

@ApiTags("System Integrator")
@Controller("api/v1/system-integrator")
export class SystemIntegratorController {
  private readonly logger = new Logger(SystemIntegratorController.name);

  constructor(
    private readonly systemIntegratorService: SystemIntegratorService,
  ) {}

  /**
   * Validates an invoice using the System Integrator API.
   * @param params - The invoice data to validate.
   * @returns The validation result.
   */
  @Post("validate-invoice")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Validate invoice",
    description:
      "Validates an invoice using the FIRS API. Same implementation as invoice module.",
  })
  @ApiBody({ type: FirsValidateInvoiceDto })
  @ApiResponse({
    status: 200,
    description: "Invoice validation result",
    schema: {
      type: "object",
      properties: {
        ok: { type: "boolean" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async validateInvoice(
    @Body() params: FirsValidateInvoiceDto,
  ): Promise<{ ok: boolean }> {
    this.logger.log(`Received validate invoice request for IRN: ${params.irn}`);
    try {
      const result = await this.systemIntegratorService.validateInvoice(params);
      this.logger.log(`Invoice validation completed for IRN: ${params.irn}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to validate invoice with IRN: ${params.irn}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generates a QR code for an invoice using the System Integrator API.
   * @param params - The QR code generation parameters.
   * @returns The QR code data.
   */
  @Post("qr-code")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Generate QR code",
    description:
      "Generates FIRS QR code encrypted payload (same as invoice module). Supports passing firsPublicKeyBase64 and firsCertificateBase64 in payload, or userId for stored settings, or env vars.",
  })
  @ApiBody({ type: GenerateQrCodeDto })
  @ApiResponse({
    status: 200,
    description: "QR code generation result",
    schema: {
      type: "object",
      properties: {
        qrCode: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async generateQrCode(
    @Body() params: GenerateQrCodeDto,
  ): Promise<{ qrCode: string }> {
    this.logger.log(`Received generate QR code request for IRN: ${params.irn}`);
    try {
      const result = await this.systemIntegratorService.generateQrCode(params);
      this.logger.log(`QR code generation completed for IRN: ${params.irn}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to generate QR code for IRN: ${params.irn}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Gets FIRS settings for a user.
   * @param userId - The user ID.
   * @returns The FIRS settings.
   */
  @Get("firs-settings/:userId")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Get FIRS settings for a user",
    description:
      "Retrieves stored FIRS_PUBLIC_KEY_BASE64 and FIRS_CERTIFICATE_BASE64 for the given user",
  })
  @ApiParam({ name: "userId", description: "User ID", example: 1 })
  @ApiResponse({
    status: 200,
    description: "FIRS settings retrieved successfully",
    schema: {
      type: "object",
      properties: {
        firsPublicKeyBase64: { type: "string", nullable: true },
        firsCertificateBase64: { type: "string", nullable: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Settings not found for user" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getFirsSettings(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<{
    firsPublicKeyBase64: string | null;
    firsCertificateBase64: string | null;
  } | null> {
    this.logger.log(`Received get FIRS settings request for user: ${userId}`);
    try {
      const result = await this.systemIntegratorService.getFirsSettings(userId);
      this.logger.log(`FIRS settings retrieved for user: ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get FIRS settings for user: ${userId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Creates or updates FIRS settings for a user.
   * @param params - The settings to update.
   * @returns The updated settings.
   */
  @Put("firs-settings")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Set FIRS settings for a user",
    description:
      "Stores FIRS_PUBLIC_KEY_BASE64 and FIRS_CERTIFICATE_BASE64 for the given user",
  })
  @ApiBody({ type: UpdateFirsSettingsDto })
  @ApiResponse({
    status: 200,
    description: "FIRS settings updated successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "number" },
        firsPublicKeyBase64: { type: "string", nullable: true },
        firsCertificateBase64: { type: "string", nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async updateFirsSettings(@Body() params: UpdateFirsSettingsDto): Promise<{
    userId: number;
    firsPublicKeyBase64: string | null;
    firsCertificateBase64: string | null;
  }> {
    this.logger.log(
      `Received update FIRS settings request for user: ${params.userId}`,
    );
    try {
      const result =
        await this.systemIntegratorService.updateFirsSettings(params);
      this.logger.log(`FIRS settings updated for user: ${params.userId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update FIRS settings for user: ${params.userId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Admin/test endpoint for smoke testing.
   */
  @Post("test")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Test endpoint for System Integrator module" })
  @ApiResponse({
    status: 200,
    description: "Test successful",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        timestamp: { type: "string" },
      },
    },
  })
  async test(): Promise<{ message: string; timestamp: string }> {
    this.logger.log("System Integrator test endpoint called");
    return {
      message: "System Integrator module is working",
      timestamp: new Date().toISOString(),
    };
  }
}
