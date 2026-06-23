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
import { ApiTags } from "@nestjs/swagger";
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
  @Get("invoice/transmit/pull")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async transmitPullInvoice(@CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyTransmitPullInvoice(userId);
    return result.data;
  }

  @Public()
  @Post("invoice/transmit/:irn")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  async transmitInvoice(@Param("irn") irn: string, @CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyTransmitInvoice(userId, irn);
    return result.data;
  }

  @Public()
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
  @Post("invoice/irn/validate")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async validateIrn(@Body() payload: ValidateIrnDto, @CurrentUser() req: any) {
    const userId: number = req.id;
    const result = await this.clientsService.proxyValidateIrn(userId, payload);
    return result.data ?? { ok: true };
  }

  // Key management (JWT, role must be CLIENT handled at business layer)
  @Post("keys")
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getKeys(@CurrentUser() req: any) {
    const userId: number = req.id;
    const keys = await this.clientsService.getKeys(userId);
    return keys;
  }

  @Get("logs")
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
