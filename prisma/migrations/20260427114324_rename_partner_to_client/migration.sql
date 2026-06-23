/*
  Warnings:

  - The values [PARTNER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `partner_api_credentials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partner_api_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('USER', 'ADMIN', 'CLIENT');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."partner_api_credentials" DROP CONSTRAINT "partner_api_credentials_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."partner_api_logs" DROP CONSTRAINT "partner_api_logs_userId_fkey";

-- DropTable
DROP TABLE "public"."partner_api_credentials";

-- DropTable
DROP TABLE "public"."partner_api_logs";

-- CreateTable
CREATE TABLE "public"."client_api_credentials" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_api_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_api_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestBody" TEXT,
    "responseStatus" INTEGER NOT NULL,
    "responseBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_api_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_api_credentials_userId_key" ON "public"."client_api_credentials"("userId");

-- AddForeignKey
ALTER TABLE "public"."client_api_credentials" ADD CONSTRAINT "client_api_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_api_logs" ADD CONSTRAINT "client_api_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
