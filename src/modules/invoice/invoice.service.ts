import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  BadGatewayException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../../database";
import axios from "axios";
import {
  GetEntityDto,
  ValidateIrnDto,
  ValidateInvoiceDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from "./dtos";
import { generateFirsQrCode } from "../../shared/helpers/firs-qr-code.helper";
import { decryptCredential } from "../../shared/helpers/crypto.util";

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly firsApiUrl: string = process.env.FIRS_API_URL ?? "";
  private readonly firsApiKey: string = process.env.FIRS_API_KEY ?? "";
  private readonly firsApiSecret: string = process.env.FIRS_API_SECRET ?? "";

  
  private async getFirsHeadersForBusiness(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business?.firsApiKey || !business?.firsApiSecret) {
      throw new BadRequestException(
        "Business FIRS API credentials not configured. Please update FIRS settings.",
      );
    }

    return {
      "Content-Type": "application/json",
      "x-api-key": decryptCredential(business.firsApiKey),
      "x-api-secret": decryptCredential(business.firsApiSecret),
    };
  }

  private buildFirsHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.firsApiKey,
      "x-api-secret": this.firsApiSecret,
    };
  }

  private parseTransmitError(error: any) {
    const responseData = error?.response?.data;
    const upstreamError = responseData?.error ?? {};
    const publicMessage =
      upstreamError.public_message ??
      upstreamError.details ??
      responseData?.message ??
      error?.message ??
      "Transmission failed";
    const details = upstreamError.details ?? publicMessage;
    const searchableText = JSON.stringify(responseData ?? error?.message ?? "")
      .toLowerCase();
    const accessPointsOffline =
      searchableText.includes("access points are offline") ||
      searchableText.includes("corresponding access points are offline");

    return {
      statusCode: error?.response?.status,
      responseBody: responseData,
      code: responseData?.code,
      message: responseData?.message,
      publicMessage,
      details,
      errorId: upstreamError.id,
      handler: upstreamError.handler,
      retryable: accessPointsOffline,
    };
  }

  private createTransmitException(
    irn: string,
    context: ReturnType<InvoiceService["parseTransmitError"]>,
    invoice?: { id: number; status: string },
  ) {
    const response = {
      message: context.retryable
        ? `Invoice transmission is temporarily unavailable: ${context.publicMessage}`
        : `Transmit invoice failed: ${context.publicMessage}`,
      error: context.retryable ? "Transmission Temporarily Unavailable" : "Bad Gateway",
      retryable: context.retryable,
      invoice: invoice
        ? {
            id: invoice.id,
            irn,
            status: invoice.status,
          }
        : {
            irn,
          },
      upstream: {
        statusCode: context.statusCode,
        code: context.code,
        message: context.message,
        publicMessage: context.publicMessage,
        details: context.details,
        errorId: context.errorId,
        handler: context.handler,
      },
    };

    return context.retryable
      ? new ServiceUnavailableException(response)
      : new BadGatewayException(response);
  }

  private async sendTransmitInvoiceRequest(irn: string, businessId: string): Promise<any> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/transmit/${encodeURIComponent(irn)}`;
    const response = await axios.post(
      url,
      {},
      {
        headers: this.buildFirsHeaders(),
      },
    );
    return response.data;
  }

  private async updateInvoiceTransmissionFailure(
    invoiceId: number,
    retryable: boolean,
  ): Promise<string> {
    const status = retryable
      ? "TRANSMISSION_PENDING_RETRY"
      : "TRANSMISSION_FAILED";

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        failedAt: new Date(),
      },
    });

    return status;
  }

  /**
   * Retrieves entity information by entity ID from the FIRS API.
   * @param entityId - The unique identifier of the entity to retrieve.
   * @returns The entity information from the FIRS API.
   */
  async getEntityById(entityId: string): Promise<any> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/entity/${entityId}`;

    try {
      this.logger.log(`Fetching entity with ID: ${entityId}`);

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });

      this.logger.log(`Successfully fetched entity with ID: ${entityId}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch entity with ID: ${entityId}`,
        error.stack,
      );

      if (error.response) {
        throw new BadGatewayException(
          `Failed to fetch entity: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to fetch entity: ${error.message}`);
    }
  }

  /**
   * Validates an IRN (Invoice Reference Number) using the FIRS API.
   * @param params - The parameters required to validate the IRN.
   * @returns The validation result from the FIRS API.
   */
  async validateIrn(params: ValidateIrnDto): Promise<{ ok: boolean }> {
    const url = `${this.firsApiUrl}/api/v1/invoice/irn/validate`;
    const body = {
      invoice_reference: params.invoice_reference,
      business_id: params.business_id,
      irn: params.irn,
    };

    try {
      this.logger.log(
        `Validating IRN: ${params.irn} for invoice: ${params.invoice_reference}`,
      );

      const response = await axios.post(url, body, {
        headers: await this.getFirsHeadersForBusiness(params.business_id),
      });

      this.logger.log(`Successfully validated IRN: ${params.irn}`);

      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.ok === "boolean"
      ) {
        return { ok: response.data.data.ok };
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      this.logger.error(`Failed to validate IRN: ${params.irn}`, error.stack);

      if (error.response) {
        throw new BadGatewayException(
          `Failed to validate IRN: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to validate IRN: ${error.message}`);
    }
  }

  /**
   * Validates an invoice using the FIRS API.
   * @param params - The invoice data to validate.
   * @returns The validation result from the FIRS API.
   */
  async validateInvoice(params: ValidateInvoiceDto): Promise<{ ok: boolean }> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/validate`;

    try {
      this.logger.log(`Validating invoice with IRN: ${params.irn}`);

      const response = await axios.post(url, params, {
        headers: await this.getFirsHeadersForBusiness(params.business_id),
      });

      this.logger.log(`Successfully validated invoice with IRN: ${params.irn}`);

      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.ok === "boolean"
      ) {
        return { ok: response.data.data.ok };
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      this.logger.error(
        `Failed to validate invoice with IRN: ${params.irn}`,
        error.stack,
      );

      if (error.response) {
        throw new BadGatewayException(
          `Failed to validate invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to validate invoice: ${error.message}`);
    }
  }

  /**
   * Signs an invoice using the FIRS API.
   * @param params - The invoice data to sign.
   * @returns The signing result from the FIRS API.
   */
  async signInvoice(params: ValidateInvoiceDto): Promise<{ ok: boolean }> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/sign`;

    try {
      this.logger.log(`Signing invoice with IRN: ${params.irn}`);

      const response = await axios.post(url, params, {
        headers: await this.getFirsHeadersForBusiness(params.business_id),
      });

      this.logger.log(`Successfully signed invoice with IRN: ${params.irn}`);

      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.ok === "boolean"
      ) {
        return { ok: response.data.data.ok };
      }
      throw new BadGatewayException("Invalid response from FIRS API");
    } catch (error) {
      this.logger.error(
        `Failed to sign invoice with IRN: ${params.irn}`,
        error.stack,
      );

      if (error.response) {
        throw new BadGatewayException(
          `Failed to sign invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to sign invoice: ${error.message}`);
    }
  }

  /**
   * Self health check for transmit readiness.
   * Sends a test notification to confirm setup and valid API key.
   * @returns The health check result from the FIRS API.
   */
  async transmitSelfHealthCheck(): Promise<any> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }
    const url = `${this.firsApiUrl}/api/v1/invoice/transmit/self-health-check`;
    try {
      this.logger.log("Running transmit self health check");
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });
      this.logger.log("Transmit self health check successful");
      return response.data;
    } catch (error) {
      this.logger.error("Transmit self health check failed", error.stack);
      if (error.response) {
        throw new BadGatewayException(
          `Transmit self health check failed: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Transmit self health check failed: ${error.message}`);
    }
  }

  /**
   * Lookup invoice details by IRN.
   * @param irn - The Invoice Reference Number.
   * @returns The invoice and involved parties details.
   */
  async transmitLookupIrn(irn: string): Promise<any> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }
    const url = `${this.firsApiUrl}/api/v1/invoice/transmit/lookup/${encodeURIComponent(irn)}`;
    try {
      this.logger.log(`Transmit lookup IRN: ${irn}`);
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });
      this.logger.log(`Transmit lookup IRN successful: ${irn}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Transmit lookup IRN failed: ${irn}`, error.stack);
      if (error.response) {
        throw new BadGatewayException(
          `Transmit lookup IRN failed: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Transmit lookup IRN failed: ${error.message}`);
    }
  }

  /**
   * Lookup details by TIN (Tax Identification Number).
   * @param tin - The Tax Identification Number.
   * @returns The invoice and involved parties details.
   */
  async transmitLookupTin(tin: string): Promise<any> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }
    const url = `${this.firsApiUrl}/api/v1/invoice/transmit/lookup/tin/${encodeURIComponent(tin)}`;
    try {
      this.logger.log(`Transmit lookup TIN: ${tin}`);
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });
      this.logger.log(`Transmit lookup TIN successful: ${tin}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Transmit lookup TIN failed: ${tin}`, error.stack);
      if (error.response) {
        throw new BadGatewayException(
          `Transmit lookup TIN failed: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Transmit lookup TIN failed: ${error.message}`);
    }
  }

  /**
   * Transmit invoice - sends webhook notification to all involved parties.
   * @param irn - The Invoice Reference Number.
   * @returns The transmit result.
   */
  async transmitInvoice(irn: string): Promise<any> {
    try {
      this.logger.log(`Transmit invoice: ${irn}`);
      const invoiceRec = await this.prisma.invoice.findUnique({ where: { irn } });
      if (!invoiceRec) throw new NotFoundException("Invoice not found");
      const response = await this.sendTransmitInvoiceRequest(irn, invoiceRec.businessId);
      this.logger.log(`Transmit invoice successful: ${irn}`);
      return response;
    } catch (error) {
      this.logger.error(`Transmit invoice failed: ${irn}`, error.stack);
      const context = this.parseTransmitError(error);
      throw this.createTransmitException(irn, context);
    }
  }

  /**
   * Confirm receipt of transmitted invoice.
   * Each party must acknowledge receipt; invoice is "completely transmitted" when all acknowledge.
   * @param irn - The Invoice Reference Number.
   * @returns The confirmation result.
   */
  async transmitConfirmReceipt(irn: string): Promise<any> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }
    const invoiceRec = await this.prisma.invoice.findUnique({ where: { irn } });
    if (!invoiceRec) throw new NotFoundException("Invoice not found");
    const url = `${this.firsApiUrl}/api/v1/invoice/transmit/${encodeURIComponent(irn)}`;
    try {
      this.logger.log(`Transmit confirm receipt: ${irn}`);
      const response = await axios.patch(
        url,
        {},
        {
          headers: await this.getFirsHeadersForBusiness(invoiceRec.businessId),
        },
      );
      this.logger.log(`Transmit confirm receipt successful: ${irn}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Transmit confirm receipt failed: ${irn}`, error.stack);
      if (error.response) {
        throw new BadGatewayException(
          `Transmit confirm receipt failed: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Transmit confirm receipt failed: ${error.message}`);
    }
  }

  /**
   * Lookup invoice by ID - fetches invoice IRN and calls transmit lookup.
   * @param invoiceId - The invoice ID.
   * @returns The lookup result from FIRS API.
   */
  async transmitLookupIrnById(invoiceId: number): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { irn: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }
    return this.transmitLookupIrn(invoice.irn);
  }

  /**
   * Transmit invoice by ID - fetches invoice IRN and sends webhook to involved parties.
   * @param invoiceId - The invoice ID.
   * @returns The transmit result.
   */
  async transmitInvoiceById(invoiceId: number): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, irn: true, businessId: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    try {
      const result = await this.sendTransmitInvoiceRequest(invoice.irn, invoice.businessId);
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "TRANSMITTING",
          failedAt: null,
          updatedAt: new Date(),
        },
      });
      return result;
    } catch (error) {
      const context = this.parseTransmitError(error);
      let status = context.retryable
        ? "TRANSMISSION_PENDING_RETRY"
        : "TRANSMISSION_FAILED";

      try {
        status = await this.updateInvoiceTransmissionFailure(
          invoiceId,
          context.retryable,
        );
      } catch (updateError) {
        this.logger.error(
          `Failed to update transmission failure status for invoice ID: ${invoiceId}`,
          updateError.stack,
        );
      }

      throw this.createTransmitException(invoice.irn, context, {
        id: invoiceId,
        status,
      });
    }
  }

  async retryTransmitInvoiceById(invoiceId: number): Promise<any> {
    return this.transmitInvoiceById(invoiceId);
  }

  /**
   * Confirm receipt of transmitted invoice by ID.
   * @param invoiceId - The invoice ID.
   * @returns The confirmation result.
   */
  async transmitConfirmReceiptById(invoiceId: number): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { irn: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }
    return this.transmitConfirmReceipt(invoice.irn);
  }

  /**
   * Pull invoice - retrieves invoices in transit and updates local status to TRANSMITTING.
   * @returns The pulled invoices and updates local transit invoices to TRANSMITTING.
   */
  async transmitPullInvoice(userId?: number): Promise<any> {
    if (!this.firsApiUrl || !this.firsApiKey || !this.firsApiSecret) {
      throw new InternalServerErrorException(
        "FIRS API credentials are not set in environment variables",
      );
    }
    const url = `${this.firsApiUrl}/api/v1/invoice/transmit/pull`;
    try {
      this.logger.log("Transmit pull invoice");
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });
      const data = response.data;
      if (data?.data?.invoices && Array.isArray(data.data.invoices)) {
        const irns = data.data.invoices
          .map((inv: { irn?: string }) => inv.irn)
          .filter(Boolean);
        if (irns.length > 0) {
          // Scope update to the calling user's invoices to prevent cross-client mutation
          const whereClause: any = { irn: { in: irns } };
          if (userId) {
            whereClause.userId = userId;
          }
          await this.prisma.invoice.updateMany({
            where: whereClause,
            data: { status: "TRANSMITTING", updatedAt: new Date() },
          });
          this.logger.log(`Updated invoices to TRANSMITTING for pulled IRNs`);
        }
      }
      this.logger.log("Transmit pull invoice successful");
      return response.data;
    } catch (error) {
      this.logger.error("Transmit pull invoice failed", error.stack);
      if (error.response) {
        throw new BadGatewayException(
          `Transmit pull invoice failed: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Transmit pull invoice failed: ${error.message}`);
    }
  }

  /**
   * Gets invoice confirmation details by IRN using the FIRS API.
   * @param irn - The Invoice Reference Number to confirm.
   * @returns The confirmation details of the invoice.
   */
  async getInvoiceConfirmation(irn: string): Promise<any> {
    const invoiceRec = await this.prisma.invoice.findUnique({ where: { irn } });
    if (!invoiceRec) throw new NotFoundException("Invoice not found");

    const url = `${this.firsApiUrl}/api/v1/invoice/confirm/${encodeURIComponent(irn)}`;

    try {
      this.logger.log(`Getting invoice confirmation for IRN: ${irn}`);

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.firsApiKey,
          "x-api-secret": this.firsApiSecret,
        },
      });

      this.logger.log(
        `Successfully retrieved invoice confirmation for IRN: ${irn}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get invoice confirmation for IRN: ${irn}`,
        error.stack,
      );

      if (error.response) {
        throw new BadGatewayException(
          `Failed to get invoice confirmation: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadGatewayException(`Failed to get invoice confirmation: ${error.message}`);
    }
  }

  /**
   * Gets all invoices for a specific user with pagination.
   * @param userId - The user ID to get invoices for.
   * @param page - The page number (1-based).
   * @param limit - The number of invoices per page.
   * @returns Paginated invoices for the user.
   */
  async getInvoicesByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ invoices: any[]; total: number; page: number; limit: number }> {
    try {
      this.logger.log(
        `Getting invoices for user ID: ${userId}, page: ${page}, limit: ${limit}`,
      );

      const skip = (page - 1) * limit;

      const [invoices, total] = await Promise.all([
        this.prisma.invoice.findMany({
          where: { userId },
          skip,
          take: limit,
          include: {
            invoiceDeliveryPeriod: true,
            accountingSupplierParty: {
              include: {
                postalAddress: true,
              },
            },
            accountingCustomerParty: {
              include: {
                postalAddress: true,
              },
            },
            billingReferences: true,
            documentReferences: true,
            dispatchDocumentReference: true,
            receiptDocumentReference: true,
            originatorDocumentReference: true,
            contractDocumentReference: true,
            paymentMeans: true,
            allowanceCharges: true,
            taxTotals: {
              include: {
                taxSubtotals: {
                  include: {
                    taxCategory: true,
                  },
                },
              },
            },
            legalMonetaryTotal: true,
            invoiceLines: {
              include: {
                item: true,
                price: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.invoice.count({
          where: { userId },
        }),
      ]);

      this.logger.log(
        `Successfully retrieved ${invoices.length} invoices for user ID: ${userId}`,
      );

      return {
        invoices,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get invoices for user ID: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException(`Failed to get invoices: ${error.message}`);
    }
  }

  /**
   * Gets a single invoice by ID.
   * @param invoiceId - The invoice ID to retrieve.
   * @returns The invoice with all related data and encrypted QR code.
   */
  async getInvoiceById(invoiceId: number): Promise<any> {
    try {
      this.logger.log(`Getting invoice with ID: ${invoiceId}`);

      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          invoiceDeliveryPeriod: true,
          accountingSupplierParty: {
            include: {
              postalAddress: true,
            },
          },
          accountingCustomerParty: {
            include: {
              postalAddress: true,
            },
          },
          billingReferences: true,
          documentReferences: true,
          dispatchDocumentReference: true,
          receiptDocumentReference: true,
          originatorDocumentReference: true,
          contractDocumentReference: true,
          paymentMeans: true,
          allowanceCharges: true,
          taxTotals: {
            include: {
              taxSubtotals: {
                include: {
                  taxCategory: true,
                },
              },
            },
          },
          legalMonetaryTotal: true,
          invoiceLines: {
            include: {
              item: true,
              price: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
      }

      let encryptedBase64: string | undefined;
      try {
        const irn_id = invoice.irn;

        const business = await this.prisma.business.findUnique({
          where: { id: invoice.businessId }
        });

        encryptedBase64 = generateFirsQrCode(
          irn_id,
          business?.firsPublicKeyBase64 ?? undefined,
          business?.firsCertificateBase64 ?? undefined
        );
        this.logger.log(
          `Successfully generated QR code for invoice with ID: ${invoiceId}`,
        );
      } catch (qrError) {
        this.logger.warn(
          `Failed to generate QR code for invoice with ID: ${invoiceId}`,
          qrError.message,
        );
      }

      this.logger.log(`Successfully retrieved invoice with ID: ${invoiceId}`);
      return {
        ...invoice,
        encryptedBase64,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get invoice with ID: ${invoiceId}`,
        error.stack,
      );
      throw error instanceof NotFoundException ? error : new InternalServerErrorException(`Failed to get invoice: ${error.message}`);
    }
  }

  /**
   * Signs an invoice by ID and updates its status.
   * @param invoiceId - The invoice ID to sign.
   * @returns The signing result and updated invoice.
   */
  async signInvoiceById(
    invoiceId: number,
  ): Promise<{ ok: boolean; invoice: any }> {
    try {
      this.logger.log(`Signing invoice with ID: ${invoiceId}`);

      // Get the invoice first
      const invoice = await this.getInvoiceById(invoiceId);

      // Convert invoice to DTO format for FIRS API
      const invoiceDto = this.convertInvoiceToDto(invoice);

      // Call FIRS sign API
      const signResult = await this.signInvoice(invoiceDto);

      if (signResult.ok) {
        // Update invoice status to SIGNED
        const updatedInvoice = await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "SIGNED",
            transmittedAt: new Date(),
          },
        });

        this.logger.log(`Successfully signed invoice with ID: ${invoiceId}`);
        return { ok: true, invoice: updatedInvoice };
      } else {
        throw new BadGatewayException("Failed to sign invoice via FIRS API");
      }
    } catch (error) {
      this.logger.error(
        `Failed to sign invoice with ID: ${invoiceId}`,
        error.stack,
      );
      throw error instanceof BadGatewayException || error instanceof NotFoundException ? error : new BadGatewayException(`Failed to sign invoice: ${error.message}`);
    }
  }

  /**
   * Confirms an invoice by ID and updates its status.
   * @param invoiceId - The invoice ID to confirm.
   * @returns The confirmation result and updated invoice.
   */
  async confirmInvoiceById(
    invoiceId: number,
  ): Promise<{ ok: boolean; invoice: any }> {
    try {
      this.logger.log(`Confirming invoice with ID: ${invoiceId}`);

      // Get the invoice first
      const invoice = await this.getInvoiceById(invoiceId);

      // Call FIRS confirm API
      const confirmResult = await this.getInvoiceConfirmation(invoice.irn);

      if (confirmResult) {
        // Update invoice status to CONFIRMED
        const updatedInvoice = await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "CONFIRMED",
            acknowledgedAt: new Date(),
          },
        });

        this.logger.log(`Successfully confirmed invoice with ID: ${invoiceId}`);
        return { ok: true, invoice: updatedInvoice };
      } else {
        throw new BadGatewayException("Failed to confirm invoice via FIRS API");
      }
    } catch (error) {
      this.logger.error(
        `Failed to confirm invoice with ID: ${invoiceId}`,
        error.stack,
      );
      throw error instanceof BadGatewayException || error instanceof NotFoundException ? error : new BadGatewayException(`Failed to confirm invoice: ${error.message}`);
    }
  }

  /**
   * Converts an invoice from database format to DTO format for FIRS API.
   * @param invoice - The invoice from database.
   * @returns The invoice in DTO format.
   */
  private convertInvoiceToDto(invoice: any): ValidateInvoiceDto {
    return {
      invoice_kind: invoice.invoiceKind || "B2B",
      business_id: invoice.businessId,
      irn: invoice.irn,
      issue_date: invoice.issueDate.toISOString().split("T")[0],
      due_date: invoice.dueDate
        ? invoice.dueDate.toISOString().split("T")[0]
        : undefined,
      issue_time: invoice.issueTime,
      invoice_type_code: invoice.invoiceTypeCode,
      payment_status: invoice.paymentStatus,
      note: invoice.note,
      tax_point_date: invoice.taxPointDate
        ? invoice.taxPointDate.toISOString().split("T")[0]
        : undefined,
      document_currency_code: invoice.documentCurrencyCode,
      tax_currency_code: invoice.taxCurrencyCode,
      accounting_cost: invoice.accountingCost,
      buyer_reference: invoice.buyerReference,
      order_reference: invoice.orderReference,
      actual_delivery_date: invoice.actualDeliveryDate
        ? invoice.actualDeliveryDate.toISOString().split("T")[0]
        : undefined,
      payment_terms_note: invoice.paymentTermsNote,
      invoice_delivery_period: invoice.invoiceDeliveryPeriod
        ? {
            start_date: invoice.invoiceDeliveryPeriod.startDate
              .toISOString()
              .split("T")[0],
            end_date: invoice.invoiceDeliveryPeriod.endDate
              .toISOString()
              .split("T")[0],
          }
        : undefined,
      accounting_supplier_party: {
        party_name: invoice.accountingSupplierParty.partyName,
        tin: invoice.accountingSupplierParty.tin,
        email: invoice.accountingSupplierParty.email,
        telephone: invoice.accountingSupplierParty.telephone,
        business_description:
          invoice.accountingSupplierParty.businessDescription,
        postal_address: {
          street_name: invoice.accountingSupplierParty.postalAddress.streetName,
          city_name: invoice.accountingSupplierParty.postalAddress.cityName,
          postal_zone: invoice.accountingSupplierParty.postalAddress.postalZone,
          country: invoice.accountingSupplierParty.postalAddress.country,
          lga: invoice.accountingSupplierParty.postalAddress.lga,
          state: invoice.accountingSupplierParty.postalAddress.state,
        },
      },
      accounting_customer_party: {
        party_name: invoice.accountingCustomerParty.partyName,
        tin: invoice.accountingCustomerParty.tin,
        email: invoice.accountingCustomerParty.email,
        telephone: invoice.accountingCustomerParty.telephone,
        business_description:
          invoice.accountingCustomerParty.businessDescription,
        postal_address: {
          street_name: invoice.accountingCustomerParty.postalAddress.streetName,
          city_name: invoice.accountingCustomerParty.postalAddress.cityName,
          postal_zone: invoice.accountingCustomerParty.postalAddress.postalZone,
          country: invoice.accountingCustomerParty.postalAddress.country,
          lga: invoice.accountingCustomerParty.postalAddress.lga,
          state: invoice.accountingCustomerParty.postalAddress.state,
        },
      },
      billing_reference: invoice.billingReferences?.map((ref) => ({
        irn: ref.irn,
        issue_date: ref.issueDate.toISOString().split("T")[0],
      })),
      _document_reference: invoice.documentReferences?.map((ref) => ({
        irn: ref.irn,
        issue_date: ref.issueDate.toISOString().split("T")[0],
      })),
      dispatch_document_reference: invoice.dispatchDocumentReference
        ? {
            irn: invoice.dispatchDocumentReference.irn,
            issue_date: invoice.dispatchDocumentReference.issueDate
              .toISOString()
              .split("T")[0],
          }
        : undefined,
      receipt_document_reference: invoice.receiptDocumentReference
        ? {
            irn: invoice.receiptDocumentReference.irn,
            issue_date: invoice.receiptDocumentReference.issueDate
              .toISOString()
              .split("T")[0],
          }
        : undefined,
      originator_document_reference: invoice.originatorDocumentReference
        ? {
            irn: invoice.originatorDocumentReference.irn,
            issue_date: invoice.originatorDocumentReference.issueDate
              .toISOString()
              .split("T")[0],
          }
        : undefined,
      contract_document_reference: invoice.contractDocumentReference
        ? {
            irn: invoice.contractDocumentReference.irn,
            issue_date: invoice.contractDocumentReference.issueDate
              .toISOString()
              .split("T")[0],
          }
        : undefined,
      payment_means: invoice.paymentMeans?.map((pm) => ({
        payment_means_code: pm.paymentMeansCode,
        payment_due_date: pm.paymentDueDate.toISOString().split("T")[0],
      })),
      allowance_charge: invoice.allowanceCharges?.map((ac) => ({
        charge_indicator: ac.chargeIndicator,
        amount: ac.amount,
      })),
      tax_total: invoice.taxTotals?.map((tt) => ({
        tax_amount: tt.taxAmount,
        tax_subtotal: tt.taxSubtotals?.map((ts) => ({
          taxable_amount: ts.taxableAmount,
          tax_amount: ts.taxAmount,
          tax_category: {
            id: ts.taxCategory?.categoryId,
            percent: ts.taxCategory?.percent,
          },
        })),
      })),
      legal_monetary_total: {
        line_extension_amount: invoice.legalMonetaryTotal.lineExtensionAmount,
        tax_exclusive_amount: invoice.legalMonetaryTotal.taxExclusiveAmount,
        tax_inclusive_amount: invoice.legalMonetaryTotal.taxInclusiveAmount,
        payable_amount: invoice.legalMonetaryTotal.payableAmount,
      },
      invoice_line: invoice.invoiceLines?.map((line) => ({
        hsn_code: line.hsnCode,
        product_category: line.productCategory,
        discount_rate: line.discountRate,
        discount_amount: line.discountAmount,
        fee_rate: line.feeRate,
        fee_amount: line.feeAmount,
        invoiced_quantity: line.invoicedQuantity,
        line_extension_amount: line.lineExtensionAmount,
        item: {
          name: line.item.name,
          description: line.item.description,
          sellers_item_identification: line.item.sellersItemIdentification,
        },
        price: {
          price_amount: line.price.priceAmount,
          base_quantity: line.price.baseQuantity,
          price_unit: line.price.priceUnit,
        },
      })),
    };
  }

  /**
   * Creates a new invoice and saves it to the database.
   * @param data - The invoice data to create.
   * @param userId - The authenticated user ID.
   * @returns The created invoice.
   */
  async createInvoice(data: CreateInvoiceDto, userId: number): Promise<any> {
    try {
      this.logger.log(`Creating invoice with IRN: ${data.irn}`);

      // Check if invoice with this IRN already exists
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { irn: data.irn },
      });

      if (existingInvoice) {
        throw new ConflictException(`Invoice with IRN ${data.irn} already exists`);
      }

      // // Validate invoice with FIRS API before creating

      // // Convert invoice to DTO format for FIRS API
      // const invoiceDto = this.convertInvoiceToDto(data);

      // try {
      //   this.logger.log(`Validating invoice with FIRS API before creation: ${data.irn}`);
      //   const validationResult = await this.validateInvoice(invoiceDto);

      //   if (!validationResult.ok) {
      //     throw new Error('Invoice validation failed - invoice data is invalid');
      //   }

      //   this.logger.log(`Invoice validation successful for IRN: ${data.irn}`);
      // } catch (validationError) {
      //   this.logger.error(`Invoice validation failed for IRN: ${data.irn}`, validationError.stack);
      //   throw new Error(`Invoice validation failed: ${validationError.message}`);
      // }

      let businessId = data.business_id;
      if (!businessId) {
        const userWithEntity = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { entity: { include: { businesses: true } } },
        });
        
        if (userWithEntity && userWithEntity.entity && userWithEntity.entity.businesses && userWithEntity.entity.businesses.length > 0) {
          businessId = userWithEntity.entity.businesses[0].id;
        } else {
          throw new BadRequestException("No business ID provided and no business found for user");
        }
      }

      // Calculate totals
      let lineExtTotal = 0;
      let taxExclTotal = 0;
      let taxInclTotal = 0;
      let totalTaxAmount = 0;

      const taxSubtotalsMap = new Map<
        number,
        {
          taxableAmount: number;
          taxAmount: number;
          categoryId: string;
          percent: number;
        }
      >();

      const invoiceLines = data.items.map((line) => {
        const lineExtensionAmount = line.quantity * line.unit_price;
        const taxRate = line.tax_rate ?? 7.5;
        const taxAmount = (lineExtensionAmount * taxRate) / 100;

        lineExtTotal += lineExtensionAmount;
        taxExclTotal += lineExtensionAmount;
        taxInclTotal += lineExtensionAmount + taxAmount;
        totalTaxAmount += taxAmount;

        const existingTax = taxSubtotalsMap.get(taxRate);
        if (existingTax) {
          existingTax.taxableAmount += lineExtensionAmount;
          existingTax.taxAmount += taxAmount;
        } else {
          taxSubtotalsMap.set(taxRate, {
            taxableAmount: lineExtensionAmount,
            taxAmount: taxAmount,
            categoryId: line.tax_category || "STANDARD_VAT",
            percent: taxRate,
          });
        }

        return {
          hsnCode: line.hsn_code || line.isic_code || "N/A",
          productCategory:
            line.product_category || line.service_category || "N/A",
          discountRate: 0,
          discountAmount: line.discount_amount || 0,
          feeRate: 0,
          feeAmount: line.fee_amount || 0,
          invoicedQuantity: line.quantity,
          lineExtensionAmount: lineExtensionAmount,
          item: {
            create: {
              name: line.name,
              description: line.description || "",
            },
          },
          price: {
            create: {
              priceAmount: line.unit_price,
              baseQuantity: 1,
              priceUnit: line.price_unit || "C62",
            },
          },
        };
      });

      // Create the invoice with all related data
      const invoice = await this.prisma.invoice.create({
        data: {
          businessId: businessId,
          userId: userId,
          irn: data.irn,
          issueDate: data.issue_date ? new Date(data.issue_date) : new Date(),
          dueDate: data.due_date ? new Date(data.due_date) : null,
          issueTime: data.issue_time,
          invoiceTypeCode: data.invoice_type_code || "396",
          invoiceKind: data.invoice_kind || "B2B",
          paymentStatus: data.payment_status || "PENDING",
          note: data.note,
          documentCurrencyCode: data.document_currency_code || "NGN",
          taxCurrencyCode: data.tax_currency_code || data.document_currency_code || "NGN",
          
          // Create supplier party
          accountingSupplierParty: data.supplier
            ? {
                create: {
                  partyName: data.supplier.party_name,
                  tin: data.supplier.tin,
                  email: data.supplier.email,
                  telephone: data.supplier.telephone,
                  businessDescription: data.supplier.business_description,
                  postalAddress: {
                    create: {
                      streetName: data.supplier.postal_address.street_name,
                      cityName: data.supplier.postal_address.city_name,
                      postalZone: data.supplier.postal_address.postal_zone,
                      country: data.supplier.postal_address.country ?? "NG",
                      lga: data.supplier.postal_address.lga,
                      state: data.supplier.postal_address.state,
                    },
                  },
                },
              }
            : undefined,

          // Create customer party
          accountingCustomerParty: {
            create: {
              partyName: data.customer.party_name,
              tin: data.customer.tin,
              email: data.customer.email,
              telephone: data.customer.telephone,
              businessDescription: data.customer.business_description,
              postalAddress: {
                create: {
                  streetName: data.customer.postal_address.street_name,
                  cityName: data.customer.postal_address.city_name,
                  postalZone: data.customer.postal_address.postal_zone,
                  country: data.customer.postal_address.country ?? "NG",
                  lga: data.customer.postal_address.lga,
                  state: data.customer.postal_address.state,
                },
              },
            },
          },

          // Create tax totals
          taxTotals: {
            create: [
              {
                taxAmount: totalTaxAmount,
                taxSubtotals: {
                  create: Array.from(taxSubtotalsMap.values()).map((ts) => ({
                    taxableAmount: ts.taxableAmount,
                    taxAmount: ts.taxAmount,
                    taxCategory: {
                      create: {
                        categoryId: ts.categoryId,
                        percent: ts.percent,
                      },
                    },
                  })),
                },
              },
            ],
          },

          // Create legal monetary total
          legalMonetaryTotal: {
            create: {
              lineExtensionAmount: lineExtTotal,
              taxExclusiveAmount: taxExclTotal,
              taxInclusiveAmount: taxInclTotal,
              payableAmount: taxInclTotal,
            },
          },

          // Create invoice lines
          invoiceLines: {
            create: invoiceLines,
          },
        },
        include: {
          invoiceDeliveryPeriod: true,
          accountingSupplierParty: {
            include: {
              postalAddress: true,
            },
          },
          accountingCustomerParty: {
            include: {
              postalAddress: true,
            },
          },
          billingReferences: true,
          documentReferences: true,
          dispatchDocumentReference: true,
          receiptDocumentReference: true,
          originatorDocumentReference: true,
          contractDocumentReference: true,
          paymentMeans: true,
          allowanceCharges: true,
          taxTotals: {
            include: {
              taxSubtotals: {
                include: {
                  taxCategory: true,
                },
              },
            },
          },
          legalMonetaryTotal: true,
          invoiceLines: {
            include: {
              item: true,
              price: true,
            },
          },
        },
      });

      this.logger.log(
        `Successfully created invoice with IRN: ${data.irn} and ID: ${invoice.id}`,
      );
      this.logger.log(
        `Invoice creation completed - validation passed and database record created`,
      );
      return invoice;
    } catch (error) {
      this.logger.error(
        `Failed to create invoice with IRN: ${data.irn}`,
        error.stack,
      );

      if (error.message.includes("already exists")) {
        throw new ConflictException(`Invoice with IRN ${data.irn} already exists`);
      }

      if (error.message.includes("validation failed")) {
        throw new BadRequestException(`Invoice validation failed: ${error.message}`);
      }

      throw error instanceof ConflictException || error instanceof BadRequestException ? error : new InternalServerErrorException(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Updates an invoice by ID and calls FIRS API to update the invoice.
   * @param invoiceId - The ID of the invoice to update.
   * @param updateData - The data to update the invoice with.
   * @returns The updated invoice.
   */
  async updateInvoiceById(
    invoiceId: number,
    updateData: UpdateInvoiceDto,
  ): Promise<any> {
    try {
      this.logger.log(`Updating invoice with ID: ${invoiceId}`);

      // Get the existing invoice first
      const existingInvoice = await this.getInvoiceById(invoiceId);

      if (!existingInvoice) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
      }

      // Check if invoice can be updated (only PENDING invoices should be updatable)
      if (existingInvoice.status !== "PENDING") {
        throw new BadRequestException(
          `Invoice with ID ${invoiceId} cannot be updated. Current status: ${existingInvoice.status}`,
        );
      }

      // Convert update data to FIRS API format
      // const firInvoiceData = {
      //   ...this.convertInvoiceToDto(existingInvoice),
      //   ...updateData,
      // };

      // Call FIRS API to update the invoice
      // try {
      //   const firResponse = await axios.put(
      //     `${this.firsApiUrl}/invoice/update/${existingInvoice.irn}`,
      //     firInvoiceData,
      //     {
      //       headers: {
      //         'Content-Type': 'application/json',
      //         'x-api-key': this.firsApiKey,
      //         'x-api-secret': this.firsApiSecret,
      //       },
      //     }
      //   );

      //   if (!firResponse.data || !firResponse.data.ok) {
      //     throw new Error('FIRS API update failed');
      //   }

      //   this.logger.log(`Successfully updated invoice in FIRS API with IRN: ${existingInvoice.irn}`);
      // } catch (firError) {
      //   this.logger.error(`Failed to update invoice in FIRS API: ${firError.message}`);
      //   throw new Error(`Failed to update invoice in FIRS API: ${firError.message}`);
      // }

      // Update the invoice in the database
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          businessId: updateData.business_id || existingInvoice.businessId,
          irn: updateData.irn || existingInvoice.irn,
          issueDate: updateData.issue_date
            ? new Date(updateData.issue_date)
            : existingInvoice.issueDate,
          dueDate: updateData.due_date
            ? new Date(updateData.due_date)
            : existingInvoice.dueDate,
          issueTime: updateData.issue_time || existingInvoice.issueTime,
          invoiceTypeCode:
            updateData.invoice_type_code || existingInvoice.invoiceTypeCode,
          paymentStatus:
            updateData.payment_status || existingInvoice.paymentStatus,
          note: updateData.note || existingInvoice.note,
          taxPointDate: updateData.tax_point_date
            ? new Date(updateData.tax_point_date)
            : existingInvoice.taxPointDate,
          documentCurrencyCode:
            updateData.document_currency_code ||
            existingInvoice.documentCurrencyCode,
          taxCurrencyCode:
            updateData.tax_currency_code || existingInvoice.taxCurrencyCode,
          accountingCost:
            updateData.accounting_cost || existingInvoice.accountingCost,
          buyerReference:
            updateData.buyer_reference || existingInvoice.buyerReference,
          orderReference:
            updateData.order_reference || existingInvoice.orderReference,
          actualDeliveryDate: updateData.actual_delivery_date
            ? new Date(updateData.actual_delivery_date)
            : existingInvoice.actualDeliveryDate,
          paymentTermsNote:
            updateData.payment_terms_note || existingInvoice.paymentTermsNote,
          status: "PENDING", // Reset to pending after update
          updatedAt: new Date(),
        },
        include: {
          invoiceDeliveryPeriod: true,
          accountingSupplierParty: {
            include: {
              postalAddress: true,
            },
          },
          accountingCustomerParty: {
            include: {
              postalAddress: true,
            },
          },
          billingReferences: true,
          documentReferences: true,
          dispatchDocumentReference: true,
          receiptDocumentReference: true,
          originatorDocumentReference: true,
          contractDocumentReference: true,
          paymentMeans: true,
          allowanceCharges: true,
          taxTotals: {
            include: {
              taxSubtotals: {
                include: {
                  taxCategory: true,
                },
              },
            },
          },
          legalMonetaryTotal: true,
          invoiceLines: {
            include: {
              item: true,
              price: true,
            },
          },
        },
      });

      this.logger.log(`Successfully updated invoice with ID: ${invoiceId}`);
      return updatedInvoice;
    } catch (error) {
      this.logger.error(
        `Failed to update invoice with ID: ${invoiceId}`,
        error.stack,
      );
      throw error instanceof NotFoundException || error instanceof BadRequestException ? error : new InternalServerErrorException(`Failed to update invoice: ${error.message}`);
    }
  }
}
