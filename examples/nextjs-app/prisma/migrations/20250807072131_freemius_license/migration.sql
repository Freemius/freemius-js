-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "credit" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."user_license" (
    "userId" TEXT NOT NULL,
    "fsUserId" TEXT NOT NULL,
    "fsPlanId" TEXT NOT NULL,
    "fsLicenseId" TEXT NOT NULL,
    "expiration" TIMESTAMP(3),
    "canceled" BOOLEAN NOT NULL,

    CONSTRAINT "user_license_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "user_license_fsLicenseId_idx" ON "public"."user_license"("fsLicenseId");

-- AddForeignKey
ALTER TABLE "public"."user_license" ADD CONSTRAINT "user_license_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
