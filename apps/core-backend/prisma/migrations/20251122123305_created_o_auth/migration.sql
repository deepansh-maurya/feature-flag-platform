-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."Oauth" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "rawProfile" JSONB NOT NULL,
    "tokens" JSONB NOT NULL,

    CONSTRAINT "Oauth_pkey" PRIMARY KEY ("id")
);
