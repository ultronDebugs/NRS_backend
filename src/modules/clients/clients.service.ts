import {
  ForbiddenException,
  Injectable,
  Logger,
  BadGatewayException,
  HttpException,
} from "@nestjs/common";
import { PrismaService } from "../../database";
import { InvoiceService } from "../invoice/invoice.service";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";

export interface ProxyResult {
  ok: boolean;
  data?: any;
}

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async createOrRotateKeys(
    userId: number,
  ): Promise<{ apiKey: string; apiSecret: string }> {
    await this.ensureClient(userId);
    const apiKey = this.generateToken();
    const rawSecret = this.generateToken();
    const hashedSecret = await bcrypt.hash(rawSecret, 10);

    const existing = await (this.prisma as any).clientApiCredential.findUnique({
      where: { userId },
    });
    if (existing) {
      await (this.prisma as any).clientApiCredential.update({
        where: { userId },
        data: { apiKey, apiSecret: hashedSecret, isActive: true },
      });
    } else {
      await (this.prisma as any).clientApiCredential.create({
        data: { userId, apiKey, apiSecret: hashedSecret },
      });
    }
    // Return plaintext secret only once — it cannot be retrieved again
    return { apiKey, apiSecret: rawSecret };
  }

  async getKeys(
    userId: number,
  ): Promise<{ apiKey: string; apiSecretMasked: string } | null> {
    await this.ensureClient(userId);
    const cred = await (this.prisma as any).clientApiCredential.findUnique({
      where: { userId },
    });
    if (!cred) return null;
    // Never return the full secret — show masked version only
    const maskedSecret = "****" + cred.apiSecret.slice(-4);
    return { apiKey: cred.apiKey, apiSecretMasked: maskedSecret };
  }

  async proxyValidateInvoice(
    userId: number,
    payload: any,
  ): Promise<ProxyResult> {
    const endpoint = "/api/v1/invoice/validate";
    try {
      this.logger.log(`Client validate invoice request`);
      const result = await this.invoiceService.validateInvoice(payload);
      await this.saveLog(userId, "POST", endpoint, payload, 200, result);
      this.logger.log(`Client validate invoice success`);
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(`Client validate invoice failed`, error.stack);
      await this.saveLog(userId, "POST", endpoint, payload, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Failed to validate invoice");
    }
  }

  async proxySignInvoice(userId: number, payload: any): Promise<ProxyResult> {
    const endpoint = "/api/v1/invoice/sign";
    try {
      this.logger.log(`Client sign invoice request`);
      const result = await this.invoiceService.signInvoice(payload);
      await this.saveLog(userId, "POST", endpoint, payload, 200, result);
      this.logger.log(`Client sign invoice success`);
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(`Client sign invoice failed`, error.stack);
      await this.saveLog(userId, "POST", endpoint, payload, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Failed to sign invoice");
    }
  }

  async proxyConfirmInvoice(userId: number, irn: string): Promise<ProxyResult> {
    await this.verifyIrnOwnership(userId, irn);
    const endpoint = `/api/v1/invoice/confirm/${irn}`;
    try {
      this.logger.log(`Client confirm invoice request for IRN: ${irn}`);
      const result = await this.invoiceService.getInvoiceConfirmation(irn);
      await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
      this.logger.log(`Client confirm invoice success for IRN: ${irn}`);
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(
        `Client confirm invoice failed for IRN: ${irn}`,
        error.stack,
      );
      await this.saveLog(userId, "GET", endpoint, undefined, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Failed to confirm invoice");
    }
  }

  async proxyValidateIrn(userId: number, payload: any): Promise<ProxyResult> {
    const endpoint = "/api/v1/invoice/irn/validate";
    try {
      this.logger.log(`Client validate IRN request`);
      const result = await this.invoiceService.validateIrn(payload);
      await this.saveLog(userId, "POST", endpoint, payload, 200, result);
      this.logger.log(`Client validate IRN success`);
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(`Client validate IRN failed`, error.stack);
      await this.saveLog(userId, "POST", endpoint, payload, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Failed to validate IRN");
    }
  }

  async proxyTransmitSelfHealthCheck(userId: number): Promise<ProxyResult> {
    const endpoint = "/api/v1/invoice/transmit/self-health-check";
    try {
      this.logger.log("Client transmit self health check request");
      const result = await this.invoiceService.transmitSelfHealthCheck();
      await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
      this.logger.log("Client transmit self health check success");
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(
        "Client transmit self health check failed",
        error.stack,
      );
      await this.saveLog(userId, "GET", endpoint, undefined, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Transmit self health check failed");
    }
  }

  async proxyTransmitLookupIrn(
    userId: number,
    irn: string,
  ): Promise<ProxyResult> {
    await this.verifyIrnOwnership(userId, irn);
    const endpoint = `/api/v1/invoice/transmit/lookup/${irn}`;
    try {
      this.logger.log(`Client transmit lookup IRN request: ${irn}`);
      const result = await this.invoiceService.transmitLookupIrn(irn);
      await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
      this.logger.log(`Client transmit lookup IRN success: ${irn}`);
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(
        `Client transmit lookup IRN failed: ${irn}`,
        error.stack,
      );
      await this.saveLog(userId, "GET", endpoint, undefined, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Failed to lookup IRN");
    }
  }

  async proxyTransmitLookupTin(
    userId: number,
    tin: string,
  ): Promise<ProxyResult> {
    const endpoint = `/api/v1/invoice/transmit/lookup/tin/${tin}`;
    try {
      this.logger.log(`Client transmit lookup TIN request: ${tin}`);
      const result = await this.invoiceService.transmitLookupTin(tin);
      await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
      this.logger.log(`Client transmit lookup TIN success: ${tin}`);
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(
        `Client transmit lookup TIN failed: ${tin}`,
        error.stack,
      );
      await this.saveLog(userId, "GET", endpoint, undefined, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Failed to lookup TIN");
    }
  }

  async proxyTransmitInvoice(
    userId: number,
    irn: string,
  ): Promise<ProxyResult> {
    await this.verifyIrnOwnership(userId, irn);
    const endpoint = `/api/v1/invoice/transmit/${irn}`;
    try {
      this.logger.log(`Client transmit invoice request: ${irn}`);
      const result = await this.invoiceService.transmitInvoice(irn);
      await this.saveLog(userId, "POST", endpoint, undefined, 200, result);
      this.logger.log(`Client transmit invoice success: ${irn}`);
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(`Client transmit invoice failed: ${irn}`, error.stack);
      const responseStatus =
        error instanceof HttpException ? error.getStatus() : 500;
      await this.saveLog(userId, "POST", endpoint, undefined, responseStatus, {
        message: error.message,
      });
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadGatewayException("Failed to transmit invoice");
    }
  }

  async proxyTransmitConfirmReceipt(
    userId: number,
    irn: string,
  ): Promise<ProxyResult> {
    await this.verifyIrnOwnership(userId, irn);
    const endpoint = `/api/v1/invoice/transmit/${irn}`;
    try {
      this.logger.log(`Client transmit confirm receipt request: ${irn}`);
      const result = await this.invoiceService.transmitConfirmReceipt(irn);
      await this.saveLog(userId, "PATCH", endpoint, undefined, 200, result);
      this.logger.log(`Client transmit confirm receipt success: ${irn}`);
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error(
        `Client transmit confirm receipt failed: ${irn}`,
        error.stack,
      );
      await this.saveLog(userId, "PATCH", endpoint, undefined, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Failed to confirm receipt");
    }
  }

  async proxyTransmitPullInvoice(userId: number): Promise<ProxyResult> {
    const endpoint = "/api/v1/invoice/transmit/pull";
    try {
      this.logger.log("Client transmit pull invoice request");
      const result = await this.invoiceService.transmitPullInvoice(userId);
      await this.saveLog(userId, "GET", endpoint, undefined, 200, result);
      this.logger.log("Client transmit pull invoice success");
      return { ok: true, data: result };
    } catch (error: any) {
      this.logger.error("Client transmit pull invoice failed", error.stack);
      await this.saveLog(userId, "GET", endpoint, undefined, 500, {
        message: error.message,
      });
      throw new BadGatewayException("Failed to pull invoices");
    }
  }

  async getLogs(userId: number, page: number = 1, limit: number = 10) {
    await this.ensureClient(userId);
    // Cap limit to prevent abuse
    limit = Math.min(Math.max(limit, 1), 100);
    page = Math.max(page, 1);
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      (this.prisma as any).clientApiLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      (this.prisma as any).clientApiLog.count({ where: { userId } }),
    ]);
    return { logs, total, page, limit };
  }

  private async saveLog(
    userId: number,
    method: string,
    endpoint: string,
    requestBody: any,
    responseStatus: number,
    responseBody: any,
  ): Promise<void> {
    await (this.prisma as any).clientApiLog.create({
      data: {
        userId,
        method,
        endpoint,
        requestBody: requestBody ? JSON.stringify(requestBody) : null,
        responseStatus,
        responseBody: responseBody ? JSON.stringify(responseBody) : null,
      },
    });
  }

  private async ensureClient(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user as any).role !== "CLIENT") {
      throw new ForbiddenException("Only clients may access this resource");
    }
  }

  /**
   * Verifies that the given IRN belongs to an invoice owned by the given user.
   * Prevents IDOR — clients cannot operate on other clients' invoices.
   */
  private async verifyIrnOwnership(userId: number, irn: string): Promise<void> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { irn, userId },
      select: { id: true },
    });
    if (!invoice) {
      throw new ForbiddenException(
        "You do not have permission to access this invoice",
      );
    }
  }

  /**
   * Generates a cryptographically secure random token using crypto.randomBytes().
   * Used for API keys and secrets — NOT Math.random().
   */
  private generateToken(length: number = 48): string {
    return crypto.randomBytes(length).toString("base64url").slice(0, length);
  }
}
