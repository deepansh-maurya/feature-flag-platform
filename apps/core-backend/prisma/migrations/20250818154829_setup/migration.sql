-- CreateEnum
CREATE TYPE "public"."BillingStatus" AS ENUM ('active', 'past_due', 'grace', 'frozen');

-- CreateEnum
CREATE TYPE "public"."RoleKey" AS ENUM ('owner', 'admin', 'developer', 'ops', 'viewer', 'custom');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('invited', 'active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."FlagType" AS ENUM ('boolean', 'multivariate');

-- CreateEnum
CREATE TYPE "public"."FlagVersionStatus" AS ENUM ('active', 'draft', 'archived');

-- CreateEnum
CREATE TYPE "public"."SegmentType" AS ENUM ('rule', 'list');

-- CreateEnum
CREATE TYPE "public"."ChangeRequestStatus" AS ENUM ('open', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."SdkKeyType" AS ENUM ('client', 'server');

-- CreateEnum
CREATE TYPE "public"."KeyStatus" AS ENUM ('active', 'revoked');

-- CreateEnum
CREATE TYPE "public"."AllowlistKind" AS ENUM ('ip', 'referrer');

-- CreateEnum
CREATE TYPE "public"."OutboxStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "public"."AuditActionType" AS ENUM ('workspace_created', 'workspace_updated', 'project_created', 'project_updated', 'flag_created', 'flag_updated', 'flag_published', 'flag_archived', 'segment_created', 'segment_updated', 'member_invited', 'member_added', 'member_removed', 'token_created', 'token_revoked');

-- CreateEnum
CREATE TYPE "public"."EvalSource" AS ENUM ('web', 'ios', 'android', 'backend');

-- CreateEnum
CREATE TYPE "public"."PlanKey" AS ENUM ('free', 'pro', 'business');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('active', 'trialing', 'past_due', 'grace', 'frozen', 'canceled');

-- CreateEnum
CREATE TYPE "public"."BillingCycle" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "public"."WebhookEndpointStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."WebhookDeliveryStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "public"."Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "planKey" TEXT NOT NULL DEFAULT 'free',
    "billingStatus" "public"."BillingStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Environment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "externalIdp" TEXT,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'invited',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkspaceMember" (
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleKey" "public"."RoleKey" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("workspaceId","userId")
);

-- CreateTable
CREATE TABLE "public"."MemberProjectOverride" (
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleKeyOverride" "public"."RoleKey" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberProjectOverride_pkey" PRIMARY KEY ("workspaceId","projectId","userId")
);

-- CreateTable
CREATE TABLE "public"."Invite" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleKey" "public"."RoleKey" NOT NULL DEFAULT 'viewer',
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flag" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "public"."FlagType" NOT NULL,
    "description" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlagVersion" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "dataJson" JSONB NOT NULL,
    "status" "public"."FlagVersionStatus" NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlagVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChangeRequest" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "fromVersion" INTEGER,
    "toVersion" INTEGER NOT NULL,
    "status" "public"."ChangeRequestStatus" NOT NULL DEFAULT 'open',
    "createdBy" TEXT NOT NULL,
    "reviewerId" TEXT,
    "comment" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Segment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "public"."SegmentType" NOT NULL,
    "rulesJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SegmentMember" (
    "segmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SegmentMember_pkey" PRIMARY KEY ("segmentId","userId")
);

-- CreateTable
CREATE TABLE "public"."SdkKey" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "type" "public"."SdkKeyType" NOT NULL,
    "keyHash" TEXT NOT NULL,
    "status" "public"."KeyStatus" NOT NULL DEFAULT 'active',
    "lastUsedAt" TIMESTAMP(3),
    "rotatedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SdkKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiToken" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "scopes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AllowlistEntry" (
    "projectId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "kind" "public"."AllowlistKind" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowlistEntry_pkey" PRIMARY KEY ("projectId","envKey","kind","value")
);

-- CreateTable
CREATE TABLE "public"."ConfigSnapshot" (
    "projectId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "etag" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfigSnapshot_pkey" PRIMARY KEY ("projectId","envKey","version")
);

-- CreateTable
CREATE TABLE "public"."OutboxEvent" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" "public"."OutboxStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "envKey" TEXT,
    "actorUserId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actionType" "public"."AuditActionType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "ip" TEXT,
    "ua" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EvalEventRaw" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "flagKey" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "userKeyHash" TEXT NOT NULL,
    "source" "public"."EvalSource" NOT NULL,

    CONSTRAINT "EvalEventRaw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EvalRollupHourly" (
    "dateHour" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "flagKey" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EvalRollupHourly_pkey" PRIMARY KEY ("dateHour","projectId","envKey","flagKey","variant")
);

-- CreateTable
CREATE TABLE "public"."EvalRollupDaily" (
    "date" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "flagKey" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EvalRollupDaily_pkey" PRIMARY KEY ("date","projectId","envKey","flagKey","variant")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "key" "public"."PlanKey" NOT NULL,
    "priceMonthly" INTEGER NOT NULL DEFAULT 0,
    "priceYearly" INTEGER NOT NULL DEFAULT 0,
    "limitsJson" JSONB NOT NULL,
    "featuresJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "planKey" "public"."PlanKey" NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'active',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "billingCycle" "public"."BillingCycle" NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsageCountersMonthly" (
    "workspaceId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "apiRequests" INTEGER NOT NULL DEFAULT 0,
    "activeFlags" INTEGER NOT NULL DEFAULT 0,
    "members" INTEGER NOT NULL DEFAULT 0,
    "envs" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageCountersMonthly_pkey" PRIMARY KEY ("workspaceId","month")
);

-- CreateTable
CREATE TABLE "public"."NotificationSetting" (
    "workspaceId" TEXT NOT NULL,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT false,
    "webhookEnabled" BOOLEAN NOT NULL DEFAULT false,
    "slackWebhookUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSetting_pkey" PRIMARY KEY ("workspaceId")
);

-- CreateTable
CREATE TABLE "public"."WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "status" "public"."WebhookEndpointStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookDelivery" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" "public"."WebhookDeliveryStatus" NOT NULL DEFAULT 'pending',
    "responseCode" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RateLimit" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "public"."AppMigration" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "description" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tookMs" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AppMigration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "public"."Workspace"("slug");

-- CreateIndex
CREATE INDEX "Project_workspaceId_idx" ON "public"."Project"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_workspaceId_key_key" ON "public"."Project"("workspaceId", "key");

-- CreateIndex
CREATE INDEX "Environment_projectId_idx" ON "public"."Environment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Environment_projectId_key_key" ON "public"."Environment"("projectId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "public"."WorkspaceMember"("userId");

-- CreateIndex
CREATE INDEX "MemberProjectOverride_projectId_idx" ON "public"."MemberProjectOverride"("projectId");

-- CreateIndex
CREATE INDEX "MemberProjectOverride_userId_idx" ON "public"."MemberProjectOverride"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "public"."Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_workspaceId_idx" ON "public"."Invite"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_workspaceId_email_key" ON "public"."Invite"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "Role_workspaceId_idx" ON "public"."Role"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_workspaceId_key_key" ON "public"."Role"("workspaceId", "key");

-- CreateIndex
CREATE INDEX "Flag_projectId_idx" ON "public"."Flag"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Flag_projectId_key_key" ON "public"."Flag"("projectId", "key");

-- CreateIndex
CREATE INDEX "FlagVersion_flagId_envKey_idx" ON "public"."FlagVersion"("flagId", "envKey");

-- CreateIndex
CREATE UNIQUE INDEX "FlagVersion_flagId_envKey_version_key" ON "public"."FlagVersion"("flagId", "envKey", "version");

-- CreateIndex
CREATE INDEX "ChangeRequest_flagId_envKey_status_idx" ON "public"."ChangeRequest"("flagId", "envKey", "status");

-- CreateIndex
CREATE INDEX "ChangeRequest_envKey_idx" ON "public"."ChangeRequest"("envKey");

-- CreateIndex
CREATE INDEX "Segment_projectId_idx" ON "public"."Segment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_projectId_key_key" ON "public"."Segment"("projectId", "key");

-- CreateIndex
CREATE INDEX "SegmentMember_userId_idx" ON "public"."SegmentMember"("userId");

-- CreateIndex
CREATE INDEX "SdkKey_projectId_envKey_type_status_idx" ON "public"."SdkKey"("projectId", "envKey", "type", "status");

-- CreateIndex
CREATE INDEX "SdkKey_projectId_idx" ON "public"."SdkKey"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_tokenHash_key" ON "public"."ApiToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApiToken_workspaceId_status_idx" ON "public"."ApiToken"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "AllowlistEntry_projectId_envKey_kind_idx" ON "public"."AllowlistEntry"("projectId", "envKey", "kind");

-- CreateIndex
CREATE INDEX "ConfigSnapshot_projectId_envKey_idx" ON "public"."ConfigSnapshot"("projectId", "envKey");

-- CreateIndex
CREATE INDEX "OutboxEvent_status_nextRetryAt_idx" ON "public"."OutboxEvent"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "OutboxEvent_topic_idx" ON "public"."OutboxEvent"("topic");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_createdAt_idx" ON "public"."AuditLog"("workspaceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_projectId_createdAt_idx" ON "public"."AuditLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actionType_createdAt_idx" ON "public"."AuditLog"("actionType", "createdAt");

-- CreateIndex
CREATE INDEX "EvalEventRaw_projectId_envKey_flagKey_ts_idx" ON "public"."EvalEventRaw"("projectId", "envKey", "flagKey", "ts");

-- CreateIndex
CREATE INDEX "EvalEventRaw_projectId_ts_idx" ON "public"."EvalEventRaw"("projectId", "ts");

-- CreateIndex
CREATE INDEX "EvalEventRaw_ts_idx" ON "public"."EvalEventRaw"("ts");

-- CreateIndex
CREATE INDEX "EvalRollupHourly_projectId_envKey_flagKey_dateHour_idx" ON "public"."EvalRollupHourly"("projectId", "envKey", "flagKey", "dateHour");

-- CreateIndex
CREATE INDEX "EvalRollupDaily_projectId_envKey_flagKey_date_idx" ON "public"."EvalRollupDaily"("projectId", "envKey", "flagKey", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubId_key" ON "public"."Subscription"("stripeSubId");

-- CreateIndex
CREATE INDEX "Subscription_workspaceId_status_idx" ON "public"."Subscription"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Subscription_workspaceId_periodStart_periodEnd_idx" ON "public"."Subscription"("workspaceId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeInvoiceId_key" ON "public"."Invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "Invoice_workspaceId_periodStart_periodEnd_idx" ON "public"."Invoice"("workspaceId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "Invoice_workspaceId_status_idx" ON "public"."Invoice"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "UsageCountersMonthly_workspaceId_month_idx" ON "public"."UsageCountersMonthly"("workspaceId", "month");

-- CreateIndex
CREATE INDEX "NotificationSetting_webhookEnabled_idx" ON "public"."NotificationSetting"("webhookEnabled");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_workspaceId_status_idx" ON "public"."WebhookEndpoint"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_workspaceId_idx" ON "public"."WebhookEndpoint"("workspaceId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_endpointId_status_nextRetryAt_idx" ON "public"."WebhookDelivery"("endpointId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "public"."WebhookDelivery"("createdAt");

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "public"."RateLimit"("windowStart");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "public"."Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppMigration_version_key" ON "public"."AppMigration"("version");

-- AddForeignKey
ALTER TABLE "public"."Workspace" ADD CONSTRAINT "Workspace_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Environment" ADD CONSTRAINT "Environment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MemberProjectOverride" ADD CONSTRAINT "MemberProjectOverride_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MemberProjectOverride" ADD CONSTRAINT "MemberProjectOverride_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MemberProjectOverride" ADD CONSTRAINT "MemberProjectOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flag" ADD CONSTRAINT "Flag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlagVersion" ADD CONSTRAINT "FlagVersion_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "public"."Flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChangeRequest" ADD CONSTRAINT "ChangeRequest_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "public"."Flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Segment" ADD CONSTRAINT "Segment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SegmentMember" ADD CONSTRAINT "SegmentMember_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "public"."Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SdkKey" ADD CONSTRAINT "SdkKey_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AllowlistEntry" ADD CONSTRAINT "AllowlistEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfigSnapshot" ADD CONSTRAINT "ConfigSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "public"."WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
