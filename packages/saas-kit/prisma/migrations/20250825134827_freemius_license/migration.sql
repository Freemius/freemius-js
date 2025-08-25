-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "credit" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."user_license" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fsUserId" TEXT NOT NULL,
    "fsPlanId" TEXT NOT NULL,
    "fsLicenseId" TEXT NOT NULL,
    "expiration" TIMESTAMP(3),
    "canceled" BOOLEAN NOT NULL,

    CONSTRAINT "user_license_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_credit_purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fsLicenseId" TEXT NOT NULL,
    "fsUserId" TEXT NOT NULL,
    "fsPlanId" TEXT NOT NULL,
    "credit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_credit_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_license_userId_key" ON "public"."user_license"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_license_fsLicenseId_key" ON "public"."user_license"("fsLicenseId");

-- CreateIndex
CREATE UNIQUE INDEX "user_credit_purchase_fsLicenseId_key" ON "public"."user_credit_purchase"("fsLicenseId");

-- AddForeignKey
ALTER TABLE "public"."user_license" ADD CONSTRAINT "user_license_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_credit_purchase" ADD CONSTRAINT "user_credit_purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
