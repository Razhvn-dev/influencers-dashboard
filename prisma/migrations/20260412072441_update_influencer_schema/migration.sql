/*
  Warnings:

  - You are about to drop the column `handle` on the `Influencer` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunicationLog_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunicationLog_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Influencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "region" TEXT,
    "website" TEXT,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "facebookUrl" TEXT,
    "youtubeSubs" INTEGER NOT NULL DEFAULT 0,
    "instagramFollowers" INTEGER NOT NULL DEFAULT 0,
    "tiktokFollowers" INTEGER NOT NULL DEFAULT 0,
    "facebookFans" INTEGER NOT NULL DEFAULT 0,
    "totalFollowers" INTEGER NOT NULL DEFAULT 0,
    "ambassadorLevel" TEXT NOT NULL DEFAULT 'NONE',
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "contractStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "contractValue" REAL,
    "promisedProducts" TEXT,
    "deliverables" TEXT,
    "lastFollowUp" DATETIME,
    "nextFollowUp" DATETIME,
    "followUpNotes" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Influencer_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Influencer" ("contractStatus", "createdAt", "email", "facebookFans", "id", "instagramFollowers", "lastFollowUp", "name", "nextFollowUp", "notes", "region", "shopId", "status", "tiktokFollowers", "updatedAt", "youtubeSubs") SELECT "contractStatus", "createdAt", "email", "facebookFans", "id", "instagramFollowers", "lastFollowUp", "name", "nextFollowUp", "notes", "region", "shopId", "status", "tiktokFollowers", "updatedAt", "youtubeSubs" FROM "Influencer";
DROP TABLE "Influencer";
ALTER TABLE "new_Influencer" RENAME TO "Influencer";
CREATE INDEX "Influencer_shopId_idx" ON "Influencer"("shopId");
CREATE INDEX "Influencer_status_idx" ON "Influencer"("status");
CREATE INDEX "Influencer_ambassadorLevel_idx" ON "Influencer"("ambassadorLevel");
CREATE INDEX "Influencer_totalFollowers_idx" ON "Influencer"("totalFollowers");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CommunicationLog_influencerId_idx" ON "CommunicationLog"("influencerId");

-- CreateIndex
CREATE INDEX "CommunicationLog_shopId_idx" ON "CommunicationLog"("shopId");
