import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Logger,
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
import { FirsService } from "./firs.service";
import {
  LoginDto,
  SearchEntityDto,
  WebhookPayloadDto,
  WebhookResponseDto,
} from "./dtos";
import { Public } from "../../common/decorators";

@ApiTags("FIRS")
@ApiBearerAuth()
@Controller("api/v1/firs")
export class FirsController {
  private readonly logger = new Logger(FirsController.name);

  constructor(private readonly firsService: FirsService) {}

  @Post("taxpayer/authenticate")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: "Authenticate FIRS taxpayer",
    description:
      "Calls FIRS /api/v1/utilities/authenticate with the configured API key/secret and taxpayer email/password. FIRS returns the taxpayer entity_id when the credentials are valid.",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "FIRS taxpayer authentication response",
  })
  @ApiResponse({ status: 401, description: "Missing or invalid local JWT" })
  @ApiResponse({ status: 500, description: "FIRS authentication failed" })
  async authenticateTaxpayer(@Body() payload: LoginDto): Promise<any> {
    this.logger.log(`Authenticating taxpayer with FIRS: ${payload.email}`);
    return this.firsService.loginTaxpayer(payload);
  }

  @Get("entities")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Search FIRS entities",
    description:
      "Searches entities visible to the configured FIRS API key/secret. Use reference when FIRS provides one during APP/SI onboarding.",
  })
  @ApiQuery({ name: "reference", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "size", required: false, type: Number, example: 20 })
  @ApiQuery({
    name: "sortBy",
    required: false,
    type: String,
    example: "created_at",
  })
  @ApiQuery({
    name: "sortDirectionDesc",
    required: false,
    type: Boolean,
    example: true,
  })
  @ApiResponse({ status: 200, description: "FIRS entity search response" })
  @ApiResponse({ status: 401, description: "Missing or invalid local JWT" })
  @ApiResponse({ status: 500, description: "FIRS entity search failed" })
  async searchEntities(@Query() query: SearchEntityDto): Promise<any> {
    this.logger.log("Searching FIRS entities");
    return this.firsService.searchEntitiesByReference(query);
  }

  @Get("entities/:entityId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get FIRS entity by ID",
    description:
      "Fetches a FIRS entity by entity_id using the configured API key/secret.",
  })
  @ApiParam({
    name: "entityId",
    description: "FIRS entity_id",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, description: "FIRS entity response" })
  @ApiResponse({ status: 401, description: "Missing or invalid local JWT" })
  @ApiResponse({ status: 500, description: "FIRS entity fetch failed" })
  async getEntity(@Param("entityId") entityId: string): Promise<any> {
    this.logger.log(`Fetching FIRS entity: ${entityId}`);
    return this.firsService.getEntityById(entityId);
  }

  /**
   * Webhook endpoint to receive notifications from FIRS.
   * This endpoint accepts POST requests and responds with 200 OK to confirm receipt.
   * @param payload - The webhook payload containing IRN and message status.
   * @returns A response indicating successful processing.
   */
  @Public()
  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleWebhook(
    @Body() payload: WebhookPayloadDto,
  ): Promise<WebhookResponseDto> {
    this.logger.log(`Received webhook request for IRN: ${payload.irn}`);

    try {
      const response =
        await this.firsService.handleWebhookNotification(payload);
      this.logger.log(`Webhook processed successfully for IRN: ${payload.irn}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to process webhook for IRN: ${payload.irn}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Admin endpoint to manually trigger processing of failed webhooks.
   * This can be used for testing or manual retry of failed webhooks.
   */
  @Post("webhook/retry-failed")
  @HttpCode(HttpStatus.OK)
  async retryFailedWebhooks(): Promise<{ message: string }> {
    this.logger.log("Manual retry of failed webhooks triggered");

    try {
      await this.firsService.processFailedWebhooks();
      return { message: "Failed webhooks processing completed" };
    } catch (error) {
      this.logger.error("Failed to process failed webhooks", error.stack);
      throw error;
    }
  }
}
