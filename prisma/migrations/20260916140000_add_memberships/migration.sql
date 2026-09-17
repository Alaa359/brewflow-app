-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- Backfill : chaque user existant garde son établissement
INSERT INTO "Membership" ("id", "userId", "establishmentId", "createdAt")
SELECT gen_random_uuid()::text, "id", "establishmentId", now()
FROM "User";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_establishmentId_fkey";

-- DropIndex
DROP INDEX "User_establishmentId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "establishmentId";

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_establishmentId_key" ON "Membership"("userId", "establishmentId");
CREATE INDEX "Membership_establishmentId_idx" ON "Membership"("establishmentId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;