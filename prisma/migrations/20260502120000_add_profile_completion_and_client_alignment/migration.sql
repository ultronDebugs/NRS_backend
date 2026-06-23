-- Align database schema with the current onboarding and client model.

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "isProfileComplete" BOOLEAN NOT NULL DEFAULT false;

-- Rename client API tables from previous partner/client naming.
DO $$
BEGIN
  IF to_regclass('public.client_api_credentials') IS NULL
    AND to_regclass('public.client_api_credentials') IS NOT NULL THEN
    ALTER TABLE "public"."client_api_credentials" RENAME TO "client_api_credentials";
  ELSIF to_regclass('public.client_api_credentials') IS NULL
    AND to_regclass('public.partner_api_credentials') IS NOT NULL THEN
    ALTER TABLE "public"."partner_api_credentials" RENAME TO "client_api_credentials";
  END IF;

  IF to_regclass('public.client_api_logs') IS NULL
    AND to_regclass('public.client_api_logs') IS NOT NULL THEN
    ALTER TABLE "public"."client_api_logs" RENAME TO "client_api_logs";
  ELSIF to_regclass('public.client_api_logs') IS NULL
    AND to_regclass('public.partner_api_logs') IS NOT NULL THEN
    ALTER TABLE "public"."partner_api_logs" RENAME TO "client_api_logs";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_api_credentials_pkey'
  ) THEN
    ALTER TABLE "public"."client_api_credentials" RENAME CONSTRAINT "client_api_credentials_pkey" TO "client_api_credentials_pkey";
  ELSIF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'partner_api_credentials_pkey'
  ) THEN
    ALTER TABLE "public"."client_api_credentials" RENAME CONSTRAINT "partner_api_credentials_pkey" TO "client_api_credentials_pkey";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_api_logs_pkey'
  ) THEN
    ALTER TABLE "public"."client_api_logs" RENAME CONSTRAINT "client_api_logs_pkey" TO "client_api_logs_pkey";
  ELSIF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'partner_api_logs_pkey'
  ) THEN
    ALTER TABLE "public"."client_api_logs" RENAME CONSTRAINT "partner_api_logs_pkey" TO "client_api_logs_pkey";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_api_credentials_userId_fkey'
  ) THEN
    ALTER TABLE "public"."client_api_credentials" RENAME CONSTRAINT "client_api_credentials_userId_fkey" TO "client_api_credentials_userId_fkey";
  ELSIF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'partner_api_credentials_userId_fkey'
  ) THEN
    ALTER TABLE "public"."client_api_credentials" RENAME CONSTRAINT "partner_api_credentials_userId_fkey" TO "client_api_credentials_userId_fkey";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_api_logs_userId_fkey'
  ) THEN
    ALTER TABLE "public"."client_api_logs" RENAME CONSTRAINT "client_api_logs_userId_fkey" TO "client_api_logs_userId_fkey";
  ELSIF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'partner_api_logs_userId_fkey'
  ) THEN
    ALTER TABLE "public"."client_api_logs" RENAME CONSTRAINT "partner_api_logs_userId_fkey" TO "client_api_logs_userId_fkey";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'client_api_credentials_userId_key'
      AND n.nspname = 'public'
  ) THEN
    ALTER INDEX "public"."client_api_credentials_userId_key" RENAME TO "client_api_credentials_userId_key";
  ELSIF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'partner_api_credentials_userId_key'
      AND n.nspname = 'public'
  ) THEN
    ALTER INDEX "public"."partner_api_credentials_userId_key" RENAME TO "client_api_credentials_userId_key";
  END IF;
END $$;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('USER', 'ADMIN', 'CLIENT');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."Role_new" USING (
  CASE
    WHEN "role"::text IN ('CLIENT', 'PARTNER') THEN 'CLIENT'
    ELSE "role"::text
  END::"public"."Role_new"
);
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;
