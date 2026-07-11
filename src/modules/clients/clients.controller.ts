import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiHeader, ApiExcludeEndpoint } from "@nestjs/swagger";
import { ClientsService } from "./clients.service";
import { ApiKeyAuthGuard } from "./security/api-key-auth.guard";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Throttle } from "@nestjs/throttler";
import { ValidateInvoiceDto, ValidateIrnDto } from "./dtos";
import { CurrentUser, Public } from "../../common/decorators";

@ApiTags("Clients")
@Controller("api/v1/clients")
@Throttle({ default: { limit: 60, ttl: 60000 } })
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // Client APIs via API Key/Secret headers
  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Post("invoice/validate")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async validateInvoice(
    @Body() payload: ValidateInvoiceDto,
    @CurrentUser() req: any,
  ) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyValidateInvoice(
      userId,
      payload,
    );
    return result.data ?? { ok: true };
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Post("invoice/sign")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async signInvoice(
    @Body() payload: ValidateInvoiceDto,
    @CurrentUser() req: any,
  ) {
    const userId: number = req.id;
    const result = await this.clientsService.proxySignInvoice(userId, payload);
    return result.data ?? { ok: true };
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/confirm/:irn")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async confirmInvoice(@Param("irn") irn: string, @CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyConfirmInvoice(userId, irn);
    return result.data;
  }

  // --- Exchange E-Invoice Transmit APIs (Client) ---

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/transmit/self-health-check")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async transmitSelfHealthCheck(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result =
      await this.clientsService.proxyTransmitSelfHealthCheck(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/transmit/lookup/tin/:tin")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async transmitLookupTin(@Param("tin") tin: string, @CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyTransmitLookupTin(
      userId,
      tin,
    );
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/transmit/lookup/:irn")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async transmitLookupIrn(@Param("irn") irn: string, @CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyTransmitLookupIrn(
      userId,
      irn,
    );
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/transmit/pull")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async transmitPullInvoice(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyTransmitPullInvoice(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Post("invoice/transmit/:irn")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async transmitInvoice(@Param("irn") irn: string, @CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyTransmitInvoice(userId, irn);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Patch("invoice/transmit/:irn")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async transmitConfirmReceipt(
    @Param("irn") irn: string,
    @CurrentUser() req: any,
  ) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyTransmitConfirmReceipt(
      userId,
      irn,
    );
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Post("invoice/irn/validate")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async validateIrn(@Body() payload: ValidateIrnDto, @CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyValidateIrn(userId, payload);
    return result.data ?? { ok: true };
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/tax-categories")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getTaxCategories(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetTaxCategories(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/payment-means")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getPaymentMeans(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetPaymentMeans(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/countries")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getCountries(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetCountries(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/currencies")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getCurrencies(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetCurrencies(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/invoice-types")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getInvoiceTypes(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetInvoiceTypes(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/service-codes")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getServiceCodes(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetServiceCodes(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/vat-exemptions")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getVatExemptions(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetVatExemptions(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/hs-codes")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getHsCodes(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetHsCodes(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/lgas")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getLgas(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetLgas(userId);
    return result.data;
  }

  @Public()
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Client API Key' })
  @ApiHeader({ name: 'x-api-secret', required: true, description: 'Client API Secret' })
  @Get("invoice/resources/states")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async getStates(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyGetStates(userId);
    return result.data;
  }

  // Key management (JWT, role must be CLIENT handled at business layer)
  @Post("keys")
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrRotateKeys(@CurrentUser() req: any) {
    const userId: number = req.id;
    // Optionally verify role from Users table
    const keys = await this.clientsService.createOrRotateKeys(userId);
    return keys;
  }

  @Get("keys")
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getKeys(@CurrentUser() req: any) {
    const userId: number = req.id;
    const keys = await this.clientsService.getKeys(userId);
    return keys;
  }

  @Get("logs")
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLogs(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @CurrentUser() req: any,
  ) {
    const userId: number = req.id;
    const result = await this.clientsService.getLogs(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
    );
    return result;
  }
}
