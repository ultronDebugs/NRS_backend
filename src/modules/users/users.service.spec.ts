import { BadRequestException, ConflictException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CompleteProfileDto } from "./dtos";

describe("UsersService", () => {
  const buildService = () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 1,
            ...data,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
        update: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 1,
            email: "user@example.com",
            password: "hashed-password",
            role: "USER",
            isEmailVerified: true,
            isProfileComplete: data.isProfileComplete ?? false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
          }),
        ),
      },
    };

    const service = new UsersService(prisma as any, {} as any);
    return { service, prisma };
  };

  it("defaults public registration to USER", async () => {
    const { service, prisma } = buildService();

    await service.createUserLightweight({
      email: "user@example.com",
      password: "password123",
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "USER" }),
      }),
    );
  });

  it("allows CLIENT during public registration", async () => {
    const { service, prisma } = buildService();

    await service.createUserLightweight({
      email: "client@example.com",
      password: "password123",
      role: "CLIENT",
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "CLIENT" }),
      }),
    );
  });

  it("blocks ADMIN during public registration", async () => {
    const { service } = buildService();

    await expect(
      service.createUserLightweight({
        email: "admin@example.com",
        password: "password123",
        role: "ADMIN" as any,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  const completeProfileDto: CompleteProfileDto = {
    entityId: "entity-123",
    businessName: "Genius-Excel Technology Limited",
    businessAddress: "123 Main St, Lagos",
    rcNumber: "RC123456",
    dateOfIncorporation: "2020-01-01",
    firsApiKey: "mock-key",
    firsApiSecret: "mock-secret",
    firsPublicKeyBase64: "mock-pub",
    firsCertificateBase64: "mock-cert",
    businessId: "B123",
    irnTemplate: "TMP1",
    directors: [
      {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        phoneNumber: "08012345678",
        nin: "12345678901",
      },
    ],
  };

  it("completes a profile and replaces submitted directors", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 1, isProfileComplete: false })
      .mockResolvedValueOnce(null);

    await service.completeProfile(1, completeProfileDto);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          entityId: completeProfileDto.entityId,
          businessName: completeProfileDto.businessName,
          businessAddress: completeProfileDto.businessAddress,
          rcNumber: completeProfileDto.rcNumber,
          isProfileComplete: true,
          directors: {
            deleteMany: {},
            create: [
              {
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@example.com",
                phoneNumber: "08012345678",
                nin: "12345678901",
              },
            ],
          },
        }),
      }),
    );
  });

  it("allows completeProfile to update an already completed profile", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 1, isProfileComplete: true })
      .mockResolvedValueOnce({ id: 1, entityId: completeProfileDto.entityId });

    await expect(
      service.completeProfile(1, completeProfileDto),
    ).resolves.toEqual(expect.objectContaining({ isProfileComplete: true }));

    expect(prisma.user.update).toHaveBeenCalledTimes(1);
  });

  it("blocks profile updates when the submitted entityId belongs to another user", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 1, isProfileComplete: true })
      .mockResolvedValueOnce({ id: 2, entityId: completeProfileDto.entityId });

    await expect(
      service.completeProfile(1, completeProfileDto),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
