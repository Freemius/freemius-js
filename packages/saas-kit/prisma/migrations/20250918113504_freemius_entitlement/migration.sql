-- CreateEnum
CREATE TYPE "public"."FsEntitlementType" AS ENUM ('subscription', 'oneoff');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "credit" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."user_fs_entitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fsLicenseId" TEXT NOT NULL,
    "fsPlanId" TEXT NOT NULL,
    "fsPricingId" TEXT NOT NULL,
    "fsUserId" TEXT NOT NULL,
    "type" "public"."FsEntitlementType" NOT NULL,
    "expiration" TIMESTAMP(3),
    "isCanceled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_fs_entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_fs_entitlement_fsLicenseId_key" ON "public"."user_fs_entitlement"("fsLicenseId");

-- CreateIndex
CREATE INDEX "user_fs_entitlement_type_idx" ON "public"."user_fs_entitlement"("type");

-- AddForeignKey
ALTER TABLE "public"."user_fs_entitlement" ADD CONSTRAINT "user_fs_entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
