import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { HttpException } from "@nestjs/common";
import { PrismaService } from "src/database";
import { ConfigurationService } from "./configuration.service";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ConfigurationService", () => {
  let service: ConfigurationService;
  let configService: ConfigService;

  const firsConfig = {
    FIRS_API_URL: "https://api.firs.gov.ng",
    FIRS_API_KEY: "test-key",
    FIRS_API_SECRET: "test-secret",
  };

  const mockConfigService = {
    get: jest.fn((key: keyof typeof firsConfig) => firsConfig[key]),
  };

  const createModelMock = () => ({
    findMany: jest.fn().mockResolvedValue([]),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
  });

  const mockPrismaService = {
    configurationInvoiceType: createModelMock(),
    configurationPaymentMean: createModelMock(),
    configurationTaxCategory: createModelMock(),
    configurationCurrency: createModelMock(),
    configurationVatExemption: createModelMock(),
    configurationProductCode: createModelMock(),
    configurationServiceCode: createModelMock(),
    configurationLocalGovernment: createModelMock(),
    configurationState: createModelMock(),
  };

  const expectedHeaders = {
    "Content-Type": "application/json",
    "x-api-key": firsConfig.FIRS_API_KEY,
    "x-api-secret": firsConfig.FIRS_API_SECRET,
  };

  const expectFirsGet = (endpoint: string) => {
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${firsConfig.FIRS_API_URL}/api/v1/invoice/resources${endpoint}`,
      { headers: expectedHeaders },
    );
  };

  beforeEach(async () => {
    mockedAxios.get.mockReset();
    mockConfigService.get.mockImplementation(
      (key: keyof typeof firsConfig) => firsConfig[key],
    );

    Object.values(mockPrismaService).forEach((model) => {
      model.findMany.mockResolvedValue([]);
      model.createMany.mockResolvedValue({ count: 1 });
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConfigurationService>(ConfigurationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should throw error if FIRS credentials are not configured", () => {
      const missingConfig = {
        get: jest.fn((key: string) =>
          key === "FIRS_API_URL" ? undefined : "configured",
        ),
      };

      expect(
        () =>
          new ConfigurationService(
            missingConfig as unknown as ConfigService,
            mockPrismaService as unknown as PrismaService,
          ),
      ).toThrow("FIRS API credentials are not set in environment variables");
    });

    it("should initialize successfully with FIRS credentials", () => {
      expect(
        () => new ConfigurationService(configService, mockPrismaService as any),
      ).not.toThrow();
    });
  });

  describe("makeFirsApiRequest", () => {
    it("should make successful API request", async () => {
      const mockData = [{ id: "1", name: "Test" }];
      mockedAxios.get.mockResolvedValue({ data: { data: mockData } });

      const result = await service["makeFirsApiRequest"]("/test-endpoint");

      expect(result).toEqual(mockData);
      expectFirsGet("/test-endpoint");
    });

    it("should handle axios error with response", async () => {
      const axiosError = new Error("Network error") as any;
      axiosError.isAxiosError = true;
      axiosError.response = { status: 404 };
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(
        service["makeFirsApiRequest"]("/test-endpoint"),
      ).rejects.toThrow(HttpException);
    });

    it("should handle generic error", async () => {
      const genericError = new Error("Generic error");
      mockedAxios.isAxiosError.mockReturnValue(false);
      mockedAxios.get.mockRejectedValue(genericError);

      await expect(
        service["makeFirsApiRequest"]("/test-endpoint"),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("configuration resources", () => {
    const cases = [
      {
        method: "getInvoiceTypes",
        model: "configurationInvoiceType",
        endpoint: "/invoice-types",
        data: [{ value: "standard", code: "SI" }],
      },
      {
        method: "getPaymentMeans",
        model: "configurationPaymentMean",
        endpoint: "/payment-means",
        data: [{ value: "cash", code: "CASH" }],
      },
      {
        method: "getTaxCategories",
        model: "configurationTaxCategory",
        endpoint: "/tax-categories",
        data: [{ value: "standard", code: "SR" }],
      },
      {
        method: "getCurrencies",
        model: "configurationCurrency",
        endpoint: "/currencies",
        data: [
          {
            code: "NGN",
            name: "Nigerian Naira",
            symbol: "NGN",
            symbol_native: "NGN",
            decimal_digits: 2,
            rounding: 0,
            name_plural: "Nigerian naira",
          },
        ],
      },
      {
        method: "getVatExemptions",
        model: "configurationVatExemption",
        endpoint: "/vat-exemptions",
        data: [
          {
            harmonized_system_code: "0101.10.00",
            heading_no: "0101",
            tariff_category: "VAT exempt",
            tariff: "0",
            description: "Basic food items",
          },
        ],
      },
      {
        method: "getProductCodes",
        model: "configurationProductCode",
        endpoint: "/hs-codes",
        data: [
          {
            hscode: "0101.10.00",
            description: "Live horses, pure-bred breeding animals",
          },
        ],
      },
      {
        method: "getServiceCodes",
        model: "configurationServiceCode",
        endpoint: "/services-codes",
        data: [{ code: "S001", description: "Professional Services" }],
      },
      {
        method: "getLocalGovernments",
        model: "configurationLocalGovernment",
        endpoint: "/lgas",
        data: [{ name: "Abuja Municipal", code: "FCT001", state_code: "FCT" }],
      },
      {
        method: "getStateCodes",
        model: "configurationState",
        endpoint: "/states",
        data: [{ name: "Abia", code: "AB" }],
      },
    ];

    it.each(cases)(
      "should return $method data from FIRS and cache it",
      async ({ method, model, endpoint, data }) => {
        mockedAxios.get.mockResolvedValue({ data: { data } });

        const result = await service[method]();

        expect(result).toEqual(data);
        expect(mockPrismaService[model].findMany).toHaveBeenCalled();
        expect(mockPrismaService[model].createMany).toHaveBeenCalledWith({
          data: expect.any(Array),
          skipDuplicates: true,
        });
        expectFirsGet(endpoint);
      },
    );

    it("should return cached data without calling FIRS", async () => {
      const cachedData = [{ value: "cached", code: "CI" }];
      mockPrismaService.configurationInvoiceType.findMany.mockResolvedValue(
        cachedData,
      );

      const result = await service.getInvoiceTypes();

      expect(result).toEqual(cachedData);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
