import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../database";
import axios from "axios";
import { FirsValidateInvoiceDto } from "../firs/dtos/validete-invoice.dto";
import { GenerateQrCodeDto, UpdateFirsSettingsDto } from "./dtos";
import { generateFirsQrCodeWithKeys } from "./helpers/qr-code.helper";

@Injectable()
export class SystemIntegratorService {
  private readonly logger = new Logger(SystemIntegratorService.name);
  private readonly firsApiUrl: string = process.env.FIRS_API_URL ?? "";
  private readonly systemIntegratorApiKey: string =
    process.env.SYSTEM_INTEGRATOR_API_KEY ?? "";
  private readonly systemIntegratorApiSecret: string =
    process.env.SYSTEM_INTEGRATOR_API_SECRET ?? "";

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates an invoice using the FIRS API.
   * Same implementation as invoice module.
   * @param params - The invoice data to validate.
   * @returns The validation result from the FIRS API.
   */
  async validateInvoice(
    params: FirsValidateInvoiceDto,
  ): Promise<{ ok: boolean }> {
    if (
      !this.firsApiUrl ||
      !this.systemIntegratorApiKey ||
      !this.systemIntegratorApiSecret
    ) {
      throw new Error(
        "System Integrator API credentials are not set in environment variables",
      );
    }

    const url = `${this.firsApiUrl}/api/v1/invoice/validate`;

    try {
      this.logger.log(`Validating invoice with IRN: ${params.irn}`);
      const response = await axios.post(url, params, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.systemIntegratorApiKey,
          "x-api-secret": this.systemIntegratorApiSecret,
        },
      });
      this.logger.log(`Successfully validated invoice with IRN: ${params.irn}`);
      if (
        response.data &&
        response.data.data &&
        typeof response.data.data.ok === "boolean"
      ) {
        return { ok: response.data.data.ok };
      }
      throw new Error("Invalid response from FIRS API");
    } catch (error) {
      this.logger.error(
        `Failed to validate invoice with IRN: ${params.irn}`,
        error.stack,
      );
      if (error.response) {
        throw new Error(
          `Failed to validate invoice: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new Error(`Failed to validate invoice: ${error.message}`);
    }
  }

  /**
   * Generates QR code for an IRN.
   * Same implementation as invoice module - local encryption, no external API.
   * Supports passing public key and certificate in payload, or using stored user settings, or env vars.
   * @param params - The QR code generation parameters.
   * @returns The encrypted base64 QR code string.
   */
  async generateQrCode(params: GenerateQrCodeDto): Promise<{ qrCode: string }> {
    const now = new Date();
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '') + String(now.getMilliseconds()).padStart(3, '0');
    const irnWithTimestamp = `${params.irn}.${timePart}`;

    let publicKeyBase64 = params.firsPublicKeyBase64;
    let certificateBase64 = params.firsCertificateBase64;

    if ((!publicKeyBase64 || !certificateBase64) && params.userId) {
      const settings =
        await this.prisma.systemIntegratorFirsSettings.findUnique({
          where: { userId: params.userId },
        });
      if (settings) {
        publicKeyBase64 ??= settings.firsPublicKeyBase64 ?? undefined;
        certificateBase64 ??= settings.firsCertificateBase64 ?? undefined;
      }
    }

    try {
      this.logger.log(`Generating QR code for IRN: ${params.irn}`);
      const qrCode = generateFirsQrCodeWithKeys({
        irn: irnWithTimestamp,
        publicKeyBase64,
        certificateBase64,
      });
      this.logger.log(`Successfully generated QR code for IRN: ${params.irn}`);
      return { qrCode };
    } catch (error) {
      this.logger.error(
        `Failed to generate QR code for IRN: ${params.irn}`,
        error.stack,
      );
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Gets FIRS settings for a user.
   * @param userId - The user ID.
   * @returns The FIRS settings or null.
   */
  async getFirsSettings(userId: number): Promise<{
    firsPublicKeyBase64: string | null;
    firsCertificateBase64: string | null;
  } | null> {
    const settings = await this.prisma.systemIntegratorFirsSettings.findUnique({
      where: { userId },
    });
    if (!settings) {
      return null;
    }
    return {
      firsPublicKeyBase64: settings.firsPublicKeyBase64,
      firsCertificateBase64: settings.firsCertificateBase64,
    };
  }

  /**
   * Creates or updates FIRS settings for a user.
   * @param params - The settings to update.
   * @returns The updated settings.
   */
  async updateFirsSettings(params: UpdateFirsSettingsDto): Promise<{
    userId: number;
    firsPublicKeyBase64: string | null;
    firsCertificateBase64: string | null;
  }> {
    const settings = await this.prisma.systemIntegratorFirsSettings.upsert({
      where: { userId: params.userId },
      create: {
        userId: params.userId,
        firsPublicKeyBase64: params.firsPublicKeyBase64 ?? null,
        firsCertificateBase64: params.firsCertificateBase64 ?? null,
      },
      update: {
        firsPublicKeyBase64:
          params.firsPublicKeyBase64 !== undefined
            ? (params.firsPublicKeyBase64 ?? null)
            : undefined,
        firsCertificateBase64:
          params.firsCertificateBase64 !== undefined
            ? (params.firsCertificateBase64 ?? null)
            : undefined,
      },
    });

    return {
      userId: settings.userId,
      firsPublicKeyBase64: settings.firsPublicKeyBase64,
      firsCertificateBase64: settings.firsCertificateBase64,
    };
  }
}
