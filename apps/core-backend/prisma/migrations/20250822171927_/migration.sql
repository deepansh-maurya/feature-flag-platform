-- CreateTable
CREATE TABLE "public"."FlagEvaluation" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "variant" TEXT,
    "ruleMatched" TEXT,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlagEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlagEvaluation_flagId_envKey_evaluatedAt_idx" ON "public"."FlagEvaluation"("flagId", "envKey", "evaluatedAt");

-- CreateIndex
CREATE INDEX "FlagEvaluation_userId_idx" ON "public"."FlagEvaluation"("userId");
