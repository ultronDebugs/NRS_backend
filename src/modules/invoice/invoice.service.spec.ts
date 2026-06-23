import { Test, TestingModule } from "@nestjs/testing";
import { BadGatewayException, ServiceUnavailableException } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { PrismaService } from "src/database";
import axios from "axios";

jest.mock("axios");

describe("InvoiceService", () => {
  let service: InvoiceService;
  let prismaService: PrismaService;
  let prisma: any;

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(async () => {
    process.env.FIRS_API_URL = "https://firs.example.test";
    process.env.FIRS_API_KEY = "test-api-key";
    process.env.FIRS_API_SECRET = "test-api-secret";

    prisma = {
      invoice: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should have getEntityById method", () => {
    expect(service.getEntityById).toBeDefined();
  });

  it("marks invoice as transmitting after successful transmit by ID", async () => {
    prisma.invoice.findUnique.mockResolvedValue({ id: 12, irn: "INV-001" });
    prisma.invoice.update.mockResolvedValue({
      id: 12,
      irn: "INV-001",
      status: "TRANSMITTING",
    });
    mockedAxios.post.mockResolvedValue({
      data: { code: 200, data: { ok: true }, message: "success" },
    } as any);

    const result = await service.transmitInvoiceById(12);

    expect(result).toEqual({
      code: 200,
      data: { ok: true },
      message: "success",
    });
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: expect.objectContaining({
        status: "TRANSMITTING",
        failedAt: null,
      }),
    });
  });

  it("marks access-point offline transmit failures as retryable", async () => {
    prisma.invoice.findUnique.mockResolvedValue({ id: 12, irn: "INV-001" });
    prisma.invoice.update.mockResolvedValue({
      id: 12,
      irn: "INV-001",
      status: "TRANSMISSION_PENDING_RETRY",
    });
    mockedAxios.post.mockRejectedValue({
      response: {
        status: 404,
        data: {
          code: 404,
          data: null,
          message: "error has occurred",
          error: {
            id: "d2b568f9-e4f1-4560-a5aa-226caccadeca",
            handler: "transmit_actions",
            details:
              "unable to transmit this invoice as the corresponding access points are offline",
            public_message:
              "unable to transmit this invoice as the corresponding access points are offline",
          },
        },
      },
    });

    try {
      await service.transmitInvoiceById(12);
      fail("Expected transmitInvoiceById to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      expect(error.getStatus()).toBe(503);
      expect(error.getResponse()).toMatchObject({
        retryable: true,
        invoice: {
          id: 12,
          irn: "INV-001",
          status: "TRANSMISSION_PENDING_RETRY",
        },
        upstream: {
          statusCode: 404,
          errorId: "d2b568f9-e4f1-4560-a5aa-226caccadeca",
          handler: "transmit_actions",
          publicMessage:
            "unable to transmit this invoice as the corresponding access points are offline",
        },
      });
    }

    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: expect.objectContaining({
        status: "TRANSMISSION_PENDING_RETRY",
        failedAt: expect.any(Date),
      }),
    });
  });

  it("marks non-retryable transmit failures as failed", async () => {
    prisma.invoice.findUnique.mockResolvedValue({ id: 12, irn: "INV-001" });
    prisma.invoice.update.mockResolvedValue({
      id: 12,
      irn: "INV-001",
      status: "TRANSMISSION_FAILED",
    });
    mockedAxios.post.mockRejectedValue({
      response: {
        status: 500,
        data: {
          code: 500,
          message: "error has occurred",
          error: {
            id: "upstream-error",
            handler: "transmit_actions",
            public_message: "unexpected transmission error",
          },
        },
      },
    });

    await expect(service.transmitInvoiceById(12)).rejects.toBeInstanceOf(
      BadGatewayException,
    );

    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: expect.objectContaining({
        status: "TRANSMISSION_FAILED",
        failedAt: expect.any(Date),
      }),
    });
  });
});
