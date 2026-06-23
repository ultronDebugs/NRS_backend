import { HttpException, Injectable, Logger, InternalServerErrorException, BadGatewayException } from "@nestjs/common";
import { PrismaService } from "../../database";
import axios from "axios";
import { CountryEntity } from "./entities/countries.entities";
import { LoginDto } from "./dtos/firs-login.dto";
import { FirsLoginResponseEntity } from "./entities/firs-login.entity";
import { SearchEntityDto } from "./dtos/search-entity.dto";
import { ValidateIrnDto } from "./dtos/validate-irn.dto";
import { FirsValidateInvoiceDto } from "./dtos/validete-invoice.dto";
import { ConfirmEntity } from "./entities/confirm.entities";
import { UpdateInvoicePaymentStatusDto } from "./dtos/update-invoice.dto";
import { WebhookPayloadDto, WebhookResponseDto } from "./dtos/webhook.dto";

@Injectable()
export class FirsService {
  private readonly logger = new Logger(FirsService.name);

  constructor(private readonly prisma: PrismaService) {}
  private readonly firsApiUrl: string = process.env.FIRS_API_URL ?? "";
  private readonly firsApiKey: string = process.env.FIRS_API_KEY ?? "";
  private readonly firsApiSecret: string = process.env.FIRS_API_SECRET ?? "";
  private readonly siApiKey: string = process.env.SYSTEM_INTEGRATOR_API_KEY ?? "";
  private readonly siApiSecret: string = process.env.SYSTEM_INTEGRATOR_API_SECRET ?? "";

  async loginTaxpayer(loginDto: LoginDto): Promise<FirsLoginResponseEntity> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/utilities/authenticate`;
    const payload = {
      email: loginDto.email,
      password: loginDto.password,
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new BadGatewayException(`Failed to authenticate taxpayer: ${error.message}`);
    }
  }

  //#region Entity
  async getEntityById(entityId: string): Promise<any> {
    if (!this.firsApiUrl || !this.siApiKey || !this.siApiSecret) {
      throw new InternalServerErrorException(
        "SI API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/entity/${entityId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.siApiKey,
          "x-api-secret": this.siApiSecret,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new BadGatewayException(`Failed to fetch entity: ${error.message}`);
    }
  }

  async searchEntitiesByReference(searchParams: SearchEntityDto): Promise<any> {
    if (!this.firsApiUrl || !this.siApiKey || !this.siApiSecret) {
      throw new InternalServerErrorException(
        "SI API credentials are not set in environment variables",
      );
    }

    const {
      size = 20,
      page = 1,
      sortBy = "created_at",
      sortDirectionDesc = true,
    } = searchParams ?? {};

    const url = `${this.firsApiUrl}/api/v1/entity`;
    const params = {
      size,
      page,
      sort_by: sortBy,
      sort_direction_desc: sortDirectionDesc,
      reference: searchParams.reference,
    };

    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.siApiKey,
          "x-api-secret": this.siApiSecret,
        },
        params,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new BadGatewayException(`Failed to search entities: ${error.message}`);
    }
  }
  //#endregion

  //#region Resources
  async getCountries(): Promise<CountryEntity[]> {
    if (!this.firsApiUrl) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/resources/countries`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to get countries: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to get countries: ${error.message}`);
    }
  }

  async getCurrencies(): Promise<any> {
    if (!this.firsApiUrl) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/resources/currencies`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to get currencies: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to get currencies: ${error.message}`);
    }
  }

  async getTaxCategories(): Promise<any> {
    if (!this.firsApiUrl) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/resources/tax-categories`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to get tax categories: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to get tax categories: ${error.message}`);
    }
  }

  async getPaymentMeans(): Promise<any> {
    if (!this.firsApiUrl) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/resources/payment-means`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to get payment means: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to get payment means: ${error.message}`);
    }
  }

  async getInvoiceTypes(): Promise<any> {
    if (!this.firsApiUrl) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/resources/invoice-types`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to get invoice types: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to get invoice types: ${error.message}`);
    }
  }

  async getServiceCodes(): Promise<any> {
    if (!this.firsApiUrl) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/resources/services-codes`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to get service codes: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to get service codes: ${error.message}`);
    }
  }

  async getVatExemptions(): Promise<any> {
    if (!this.firsApiUrl) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/resources/vat-exemptions`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to get VAT exemptions: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to get VAT exemptions: ${error.message}`);
    }
  }

  //#endregion

  //#region Invoice

  async validateIrn(params: ValidateIrnDto): Promise<{ ok: boolean }> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/irn/validate`;
    const body = {
      invoice_reference: params.invoiceReference,
      business_id: params.businessId,
      irn: params.irn,
    };

    try {
      const response = await axios.post(url, body, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });
      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.ok === "boolean"
      ) {
        return { ok: response.data.data.ok };
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to validate IRN: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to validate IRN: ${error.message}`);
    }
  }

  async validateInvoice(
    params: FirsValidateInvoiceDto,
  ): Promise<{ ok: boolean }> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/validate`;

    try {
      const response = await axios.post(url, params, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });
      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.ok === "boolean"
      ) {
        return { ok: response.data.data.ok };
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to validate invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to validate invoice: ${error.message}`);
    }
  }

  async signInvoice(params: FirsValidateInvoiceDto): Promise<{ ok: boolean }> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/sign`;

    try {
      const response = await axios.post(url, params, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });
      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.ok === "boolean"
      ) {
        return { ok: response.data.data.ok };
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to sign invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to sign invoice: ${error.message}`);
    }
  }

  /**
   * Downloads and decrypts an invoice from the FIRS API using the provided IRN and decryption key.
   * @param params - The parameters required to download and decrypt the invoice.
   * @returns The decrypted invoice as a string.
   */
  async getDecryptedInvoice(params: {
    irn: string;
    decryptionKey: string;
  }): Promise<string> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }
    if (!params.irn) {
      throw new BadGatewayException("IRN is required to download the invoice");
    }
    if (!params.decryptionKey) {
      throw new BadGatewayException("Decryption key is required to decrypt the invoice");
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/download/${params.irn}`;

    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });

      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.iv_hex === "string" &&
        typeof response.data.data.data === "string"
      ) {
        const ivHex: string = response.data.data.iv_hex;
        const ciphertext: string = response.data.data.data;
        const key: Buffer = Buffer.from(params.decryptionKey, "base64");

        let iv: Buffer;
        try {
          iv = Buffer.from(ivHex, "hex");
        } catch (err) {
          throw new InternalServerErrorException("Error decoding IV: " + err.message);
        }

        try {
          const decrypted = this.decryptAes256Cfb(key, iv, ciphertext);
          return decrypted;
        } catch (err) {
          throw new InternalServerErrorException("Decryption error: " + err.message);
        }
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to download invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to download invoice: ${error.message}`);
    }
  }

  /**
   * Decrypts AES-256-CFB encrypted data.
   * @param key - The decryption key as a Buffer.
   * @param iv - The initialization vector as a Buffer.
   * @param ciphertext - The base64url-encoded ciphertext.
   * @returns The decrypted text as a string.
   */
  private decryptAes256Cfb(
    key: Buffer,
    iv: Buffer,
    ciphertext: string,
  ): string {
    // Decode base64url-encoded ciphertext
    const ciphertextBytes = Buffer.from(ciphertext, "base64url");
    // Create decipher instance for AES-256-CFB
    const crypto = require("crypto");
    const decipher = crypto.createDecipheriv("aes-256-cfb", key, iv);
    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(ciphertextBytes),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  }

  /**
   * Confirms an invoice by its IRN.
   * @param irn - The Invoice Reference Number to confirm.
   * @returns The confirmation details of the invoice.
   */
  async getInvoiceConfirmation(irn: string): Promise<ConfirmEntity> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/confirm/${irn}`;

    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });

      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.issue_date === "string" &&
        typeof response.data.data.due_date === "string" &&
        typeof response.data.data.sync_date === "string" &&
        typeof response.data.data.payment_status === "string" &&
        typeof response.data.data.transmitted === "boolean" &&
        typeof response.data.data.delivered === "boolean"
      ) {
        return {
          issueDate: response.data.data.issue_date,
          dueDate: response.data.data.due_date,
          syncDate: response.data.data.sync_date,
          paymentStatus: response.data.data.payment_status,
          transmitted: response.data.data.transmitted,
          delivered: response.data.data.delivered,
        };
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to confirm invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to confirm invoice: ${error.message}`);
    }
  }

  /**
   * Updates the payment status of an invoice in FIRS.
   * @param params - The parameters for updating the invoice.
   * @returns Whether the update was successful.
   */
  async updateInvoicePaymentStatus(
    params: UpdateInvoicePaymentStatusDto,
  ): Promise<{ ok: boolean }> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/update/${params.irn}`;
    const body: {
      payment_status: "PENDING" | "PAID" | "REJECTED";
      reference?: string;
    } = {
      payment_status: params.paymentStatus,
    };

    if (params.reference) {
      body.reference = params.reference;
    }

    try {
      const response = await axios.patch(url, body, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });

      if (
        response.data &&
        response.data.code === 200 &&
        response.data.data &&
        typeof response.data.data.ok === "boolean"
      ) {
        return { ok: response.data.data.ok };
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      if (error.response) {
        throw new BadGatewayException(
          `Failed to update invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to update invoice: ${error.message}`);
    }
  }

  //#endregion

  //#region Webhook

  /**
   * Handles incoming webhook notifications from FIRS.
   * @param payload - The webhook payload containing IRN and message status.
   * @returns A response indicating successful processing.
   */
  async handleWebhookNotification(
    payload: WebhookPayloadDto,
  ): Promise<WebhookResponseDto> {
    this.logger.log(
      `Received webhook notification for IRN: ${payload.irn} with status: ${payload.message}`,
    );

    try {
      // Log the webhook event for tracking
      await this.logWebhookEvent(payload);

      // Process the webhook based on the message status
      await this.processWebhookByStatus(payload);

      const response: WebhookResponseDto = {
        success: true,
        message: "Webhook processed successfully",
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Successfully processed webhook for IRN: ${payload.irn}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to process webhook for IRN: ${payload.irn}`,
        error.stack,
      );

      // Log the failed webhook for retry processing
      await this.logFailedWebhook(payload, error.message);

      throw error;
    }
  }

  /**
   * Logs webhook events for tracking and audit purposes.
   * @param payload - The webhook payload to log.
   */
  private async logWebhookEvent(payload: WebhookPayloadDto): Promise<void> {
    try {
      await this.prisma.webhookEvent.create({
        data: {
          irn: payload.irn,
          status: payload.message,
          receivedAt: new Date(),
          processed: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to log webhook event for IRN: ${payload.irn}`,
        error.stack,
      );
    }
  }

  /**
   * Logs failed webhook events for retry processing.
   * @param payload - The webhook payload that failed.
   * @param errorMessage - The error message.
   */
  private async logFailedWebhook(
    payload: WebhookPayloadDto,
    errorMessage: string,
  ): Promise<void> {
    try {
      await this.prisma.webhookEvent.create({
        data: {
          irn: payload.irn,
          status: payload.message,
          receivedAt: new Date(),
          processed: false,
          errorMessage,
          retryCount: 0,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to log failed webhook for IRN: ${payload.irn}`,
        error.stack,
      );
    }
  }

  /**
   * Processes webhook based on the message status.
   * @param payload - The webhook payload to process.
   */
  private async processWebhookByStatus(
    payload: WebhookPayloadDto,
  ): Promise<void> {
    switch (payload.message) {
      case "TRANSMITTING":
        await this.handleTransmittingStatus(payload.irn);
        break;
      case "TRANSMITTED":
        await this.handleTransmittedStatus(payload.irn);
        break;
      case "ACKNOWLEDGED":
        await this.handleAcknowledgedStatus(payload.irn);
        break;
      case "FAILED":
        await this.handleFailedStatus(payload.irn);
        break;
      default:
        this.logger.warn(
          `Unknown webhook status: ${payload.message} for IRN: ${payload.irn}`,
        );
    }
  }

  /**
   * Handles TRANSMITTING status - invoice is being transmitted.
   * @param irn - The Invoice Reference Number.
   */
  private async handleTransmittingStatus(irn: string): Promise<void> {
    this.logger.log(`Invoice ${irn} is being transmitted`);

    try {
      // Update invoice status in database
      await this.prisma.invoice.updateMany({
        where: { irn },
        data: {
          status: "TRANSMITTING",
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update invoice status for IRN: ${irn}`,
        error.stack,
      );
    }
  }

  /**
   * Handles TRANSMITTED status - invoice has been successfully transmitted.
   * @param irn - The Invoice Reference Number.
   */
  private async handleTransmittedStatus(irn: string): Promise<void> {
    this.logger.log(`Invoice ${irn} has been transmitted successfully`);

    try {
      // Update invoice status in database
      await this.prisma.invoice.updateMany({
        where: { irn },
        data: {
          status: "TRANSMITTED",
          transmittedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update invoice status for IRN: ${irn}`,
        error.stack,
      );
    }
  }

  /**
   * Handles ACKNOWLEDGED status - invoice has been acknowledged by recipient.
   * @param irn - The Invoice Reference Number.
   */
  private async handleAcknowledgedStatus(irn: string): Promise<void> {
    this.logger.log(`Invoice ${irn} has been acknowledged`);

    try {
      // Update invoice status in database
      await this.prisma.invoice.updateMany({
        where: { irn },
        data: {
          status: "ACKNOWLEDGED",
          acknowledgedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update invoice status for IRN: ${irn}`,
        error.stack,
      );
    }
  }

  /**
   * Handles FAILED status - invoice transmission failed.
   * @param irn - The Invoice Reference Number.
   */
  private async handleFailedStatus(irn: string): Promise<void> {
    this.logger.error(`Invoice ${irn} transmission failed`);

    try {
      // Update invoice status in database
      await this.prisma.invoice.updateMany({
        where: { irn },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update invoice status for IRN: ${irn}`,
        error.stack,
      );
    }
  }

  /**
   * Processes failed webhooks for retry.
   * This method can be called by a scheduled job to retry failed webhooks.
   */
  async processFailedWebhooks(): Promise<void> {
    this.logger.log("Processing failed webhooks for retry");

    try {
      const failedWebhooks = await this.prisma.webhookEvent.findMany({
        where: {
          processed: false,
          retryCount: { lt: 3 }, // Maximum 3 retries
        },
        orderBy: { receivedAt: "asc" },
        take: 100, // Process 100 at a time
      });

      for (const webhook of failedWebhooks) {
        try {
          const payload: WebhookPayloadDto = {
            irn: webhook.irn,
            message: webhook.status as any,
          };

          await this.handleWebhookNotification(payload);

          // Mark as processed
          await this.prisma.webhookEvent.update({
            where: { id: webhook.id },
            data: { processed: true },
          });
        } catch (error) {
          // Increment retry count
          await this.prisma.webhookEvent.update({
            where: { id: webhook.id },
            data: {
              retryCount: { increment: 1 },
              errorMessage: error.message,
            },
          });

          this.logger.error(
            `Retry failed for webhook ID: ${webhook.id}`,
            error.stack,
          );
        }
      }
    } catch (error) {
      this.logger.error("Failed to process failed webhooks", error.stack);
    }
  }

  //#endregion
}
