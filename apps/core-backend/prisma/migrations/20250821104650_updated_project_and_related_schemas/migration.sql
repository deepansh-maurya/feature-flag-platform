-- CreateEnum
CREATE TYPE "public"."IntegrationProvider" AS ENUM ('POSTHOG', 'SEGMENT', 'DATADOG', 'AMPLITUDE');

-- CreateEnum
CREATE TYPE "public"."IntegrationStatus" AS ENUM ('coming_soon', 'active', 'error', 'disabled');

-- CreateTable
CREATE TABLE "public"."ProjectSettings" (
    "projectId" TEXT NOT NULL,
    "flagNameRegex" TEXT NOT NULL DEFAULT '^[a-z0-9_]{3,50}$',
    "defaultFlagType" "public"."FlagType" NOT NULL DEFAULT 'boolean',
    "userIdField" TEXT NOT NULL DEFAULT 'userId',
    "bucketSeed" TEXT,
    "policies" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSettings_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "public"."IntegrationConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "provider" "public"."IntegrationProvider" NOT NULL,
    "status" "public"."IntegrationStatus" NOT NULL DEFAULT 'coming_soon',
    "apiKey" TEXT,
    "endpoint" TEXT,
    "sendExposures" BOOLEAN NOT NULL DEFAULT true,
    "sendChanges" BOOLEAN NOT NULL DEFAULT true,
    "sendMetrics" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConfig_projectId_provider_key" ON "public"."IntegrationConfig"("projectId", "provider");

-- AddForeignKey
ALTER TABLE "public"."ProjectSettings" ADD CONSTRAINT "ProjectSettings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IntegrationConfig" ADD CONSTRAINT "IntegrationConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
