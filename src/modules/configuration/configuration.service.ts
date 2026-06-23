import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../database";
import axios, { AxiosResponse } from "axios";

export interface InvoiceType {
  code: string;
  value: string;
}

export interface PaymentMean {
  code: string;
  value: string;
}

export interface TaxCategory {
  code: string;
  value: string;
}

export interface Currency {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

export interface VatExemption {
  heading_no: string;
  harmonized_system_code: string;
  tariff_category: string;
  tariff: string;
  description: string;
}

export interface ProductCode {
  hscode: string;
  description: string;
}

export interface ServiceCode {
  description: string;
  code: string;
}

export interface LocalGovernment {
  name: string;
  code: string;
  state_code: string;
}

export interface State {
  name: string;
  code: string;
}

@Injectable()
export class ConfigurationService {
  private readonly firsApiUrl: string;
  private readonly firsApiKey: string;
  private readonly firsApiSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const firsApiUrl = this.configService.get<string>("FIRS_API_URL");
    const firsApiKey = this.configService.get<string>("FIRS_API_KEY");
    const firsApiSecret = this.configService.get<string>("FIRS_API_SECRET");
    if (!firsApiUrl || !firsApiKey || !firsApiSecret) {
      throw new Error(
        "FIRS API credentials are not set in environment variables",
      );
    }
    this.firsApiUrl = firsApiUrl;
    this.firsApiKey = firsApiKey;
    this.firsApiSecret = firsApiSecret;
  }

  private async makeFirsApiRequest<T>(endpoint: string): Promise<T> {
    try {
      console.log(`${this.firsApiUrl}/api/v1/invoice/resources${endpoint}`);
      const response: AxiosResponse<{ data: T }> = await axios.get(
        `${this.firsApiUrl}/api/v1/invoice/resources${endpoint}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.firsApiKey,
            "x-api-secret": this.firsApiSecret,
          },
        },
      );
      // console.log(response);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Failed to fetch data from FIRS API: ${error.message}`,
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Failed to fetch data from FIRS API",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getCachedOrFetch<T, D>(
    modelName: string,
    firsEndpoint: string,
    transformToDb: (item: T) => D,
    transformFromDb: (item: D) => T,
  ): Promise<T[]> {
    const cachedData = await (this.prisma as any)[modelName].findMany();
    if (cachedData && cachedData.length > 0) {
      return cachedData.map(transformFromDb);
    }
    const firsData = await this.makeFirsApiRequest<T[]>(firsEndpoint);
    console.log(firsData);
    const dbData = firsData.map(transformToDb);
    await (this.prisma as any)[modelName].createMany({
      data: dbData,
      skipDuplicates: true,
    });
    return firsData;
  }

  async getInvoiceTypes(): Promise<InvoiceType[]> {
    return this.getCachedOrFetch<InvoiceType, any>(
      "configurationInvoiceType",
      "/invoice-types",
      (item) => ({
        value: item.value,
        code: item.code,
      }),
      (item) => ({
        value: item.value,
        code: item.code,
      }),
    );
  }

  async getPaymentMeans(): Promise<PaymentMean[]> {
    return this.getCachedOrFetch<PaymentMean, any>(
      "configurationPaymentMean",
      "/payment-means",
      (item) => ({
        value: item.value,
        code: item.code,
      }),
      (item) => ({
        value: item.value,
        code: item.code,
      }),
    );
  }

  async getTaxCategories(): Promise<TaxCategory[]> {
    return this.getCachedOrFetch<TaxCategory, any>(
      "configurationTaxCategory",
      "/tax-categories",
      (item) => ({
        value: item.value,
        code: item.code,
      }),
      (item) => ({
        value: item.value,
        code: item.code,
      }),
    );
  }

  async getCurrencies(): Promise<Currency[]> {
    return this.getCachedOrFetch<Currency, any>(
      "configurationCurrency",
      "/currencies",
      (item) => ({
        code: item.code,
        name: item.name,
        symbol: item.symbol,
        symbol_native: item.symbol_native,
        decimal_digits: item.decimal_digits,
        rounding: item.rounding,
        name_plural: item.name_plural,
      }),
      (item) => ({
        code: item.code,
        name: item.name,
        symbol: item.symbol,
        symbol_native: item.symbol_native,
        decimal_digits: item.decimal_digits,
        rounding: item.rounding,
        name_plural: item.name_plural,
      }),
    );
  }

  async getVatExemptions(): Promise<VatExemption[]> {
    return this.getCachedOrFetch<VatExemption, any>(
      "configurationVatExemption",
      "/vat-exemptions",
      (item) => ({
        harmonized_system_code: item.harmonized_system_code,
        heading_no: item.heading_no,
        tariff_category: item.tariff_category,
        tariff: item.tariff,
        description: item.description,
      }),
      (item) => ({
        harmonized_system_code: item.harmonized_system_code,
        heading_no: item.heading_no,
        tariff_category: item.tariff_category,
        tariff: item.tariff,
        description: item.description,
      }),
    );
  }

  async getProductCodes(): Promise<ProductCode[]> {
    return this.getCachedOrFetch<ProductCode, any>(
      "configurationProductCode",
      "/hs-codes",
      (item) => ({
        hscode: item.hscode,
        description: item.description,
      }),
      (item) => ({
        hscode: item.hscode,
        description: item.description,
      }),
    );
  }

  async getServiceCodes(): Promise<ServiceCode[]> {
    return this.getCachedOrFetch<ServiceCode, any>(
      "configurationServiceCode",
      "/services-codes",
      (item) => ({
        code: item.code,
        description: item.description,
      }),
      (item) => ({
        code: item.code,
        description: item.description,
      }),
    );
  }

  async getLocalGovernments(): Promise<LocalGovernment[]> {
    return this.getCachedOrFetch<LocalGovernment, any>(
      "configurationLocalGovernment",
      "/lgas",
      (item) => ({
        code: item.code,
        name: item.name,
        state_code: item.state_code,
      }),
      (item) => ({
        code: item.code,
        name: item.name,
        state_code: item.state_code,
      }),
    );
  }

  async getStateCodes(): Promise<State[]> {
    return this.getCachedOrFetch<State, any>(
      "configurationState",
      "/states",
      (item) => ({
        code: item.code,
        name: item.name,
      }),
      (item) => ({
        code: item.code,
        name: item.name,
      }),
    );
  }
}
