-- AlterTable
ALTER TABLE "public"."Environment" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isProd" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Flag" ADD COLUMN     "environmentId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Flag" ADD CONSTRAINT "Flag_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "public"."Environment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
