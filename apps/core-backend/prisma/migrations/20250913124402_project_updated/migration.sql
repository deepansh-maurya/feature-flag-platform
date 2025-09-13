/*
  Warnings:

  - You are about to drop the column `key` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `AllowlistEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConfigSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemberProjectOverride` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectSettings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[workspaceId,slug]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rolloutPollicies` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SdkPlatform" AS ENUM ('node', 'python', 'java', 'kotlin', 'swift', 'objectivec', 'c', 'cpp', 'csharp', 'fsharp', 'go', 'rust', 'ruby', 'php', 'perl', 'scala', 'elixir', 'erlang', 'haskell', 'clojure', 'dart', 'r');

-- DropForeignKey
ALTER TABLE "public"."AllowlistEntry" DROP CONSTRAINT "AllowlistEntry_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AllowlistEntry" DROP CONSTRAINT "AllowlistEntry_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConfigSnapshot" DROP CONSTRAINT "ConfigSnapshot_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConfigSnapshot" DROP CONSTRAINT "ConfigSnapshot_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IntegrationConfig" DROP CONSTRAINT "IntegrationConfig_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MemberProjectOverride" DROP CONSTRAINT "MemberProjectOverride_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MemberProjectOverride" DROP CONSTRAINT "MemberProjectOverride_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MemberProjectOverride" DROP CONSTRAINT "MemberProjectOverride_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectSettings" DROP CONSTRAINT "ProjectSettings_projectId_fkey";

-- DropIndex
DROP INDEX "public"."Project_workspaceId_key_key";

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "key",
ADD COLUMN     "langSupport" "public"."SdkPlatform"[],
ADD COLUMN     "rolloutPollicies" JSONB NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."AllowlistEntry";

-- DropTable
DROP TABLE "public"."ConfigSnapshot";

-- DropTable
DROP TABLE "public"."IntegrationConfig";

-- DropTable
DROP TABLE "public"."MemberProjectOverride";

-- DropTable
DROP TABLE "public"."ProjectSettings";

-- CreateIndex
CREATE UNIQUE INDEX "Project_workspaceId_slug_key" ON "public"."Project"("workspaceId", "slug");
