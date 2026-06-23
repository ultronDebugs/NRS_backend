import { Test, TestingModule } from "@nestjs/testing";
import { FirsService } from "./firs.service";
import { PrismaService } from "src/database";
import { WebhookPayloadDto } from "./dtos";

describe("FirsService", () => {
  let service: FirsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    webhookEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    invoice: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FirsService>(FirsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("handleWebhookNotification", () => {
    it("should process webhook notification successfully", async () => {
      const payload: WebhookPayloadDto = {
        irn: "INV0990-088ED42R-20270920",
        message: "TRANSMITTING",
      };

      mockPrismaService.webhookEvent.create.mockResolvedValue({ id: 1 });
      mockPrismaService.invoice.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.handleWebhookNotification(payload);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Webhook processed successfully");
      expect(mockPrismaService.webhookEvent.create).toHaveBeenCalledWith({
        data: {
          irn: payload.irn,
          status: payload.message,
          receivedAt: expect.any(Date),
          processed: true,
        },
      });
      expect(mockPrismaService.invoice.updateMany).toHaveBeenCalledWith({
        where: { irn: payload.irn },
        data: {
          status: "TRANSMITTING",
          updatedAt: expect.any(Date),
        },
      });
    });

    it("should handle different webhook statuses correctly", async () => {
      const testCases = [
        {
          message: "TRANSMITTED",
          expectedStatus: "TRANSMITTED",
          timestampField: "transmittedAt",
        },
        {
          message: "ACKNOWLEDGED",
          expectedStatus: "ACKNOWLEDGED",
          timestampField: "acknowledgedAt",
        },
        {
          message: "FAILED",
          expectedStatus: "FAILED",
          timestampField: "failedAt",
        },
      ];

      for (const testCase of testCases) {
        const payload: WebhookPayloadDto = {
          irn: "INV0990-088ED42R-20270920",
          message: testCase.message as any,
        };

        mockPrismaService.webhookEvent.create.mockResolvedValue({ id: 1 });
        mockPrismaService.invoice.updateMany.mockResolvedValue({ count: 1 });

        await service.handleWebhookNotification(payload);

        expect(mockPrismaService.invoice.updateMany).toHaveBeenLastCalledWith({
          where: { irn: payload.irn },
          data: expect.objectContaining({
            status: testCase.expectedStatus,
            updatedAt: expect.any(Date),
            [testCase.timestampField]: expect.any(Date),
          }),
        });
      }
    });

    it("should return success when invoice status update fails internally", async () => {
      const payload: WebhookPayloadDto = {
        irn: "INV0990-088ED42R-20270920",
        message: "TRANSMITTING",
      };

      mockPrismaService.webhookEvent.create.mockResolvedValue({ id: 1 });
      mockPrismaService.invoice.updateMany.mockRejectedValue(
        new Error("Update failed"),
      );

      const result = await service.handleWebhookNotification(payload);

      expect(result.success).toBe(true);
      expect(mockPrismaService.webhookEvent.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.webhookEvent.create).toHaveBeenCalledWith({
        data: {
          irn: payload.irn,
          status: payload.message,
          receivedAt: expect.any(Date),
          processed: true,
        },
      });
    });
  });
});
