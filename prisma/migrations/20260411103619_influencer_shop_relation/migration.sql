/*
  Warnings:

  - You are about to drop the column `ambassadorLevel` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `collaborationStatus` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `facebookUrl` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `instagramUrl` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `productRequested` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `shop` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `specialDeliveryRequirements` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `tiktokUrl` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `websiteUrl` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `Influencer` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `Influencer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Influencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "email" TEXT,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "notes" TEXT,
    "youtubeSubs" INTEGER NOT NULL DEFAULT 0,
    "instagramFollowers" INTEGER NOT NULL DEFAULT 0,
    "tiktokFollowers" INTEGER NOT NULL DEFAULT 0,
    "facebookFans" INTEGER NOT NULL DEFAULT 0,
    "contractStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "lastFollowUp" DATETIME,
    "nextFollowUp" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Influencer_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Influencer" ("contractStatus", "createdAt", "email", "facebookFans", "id", "instagramFollowers", "lastFollowUp", "name", "nextFollowUp", "notes", "region", "status", "tiktokFollowers", "updatedAt", "youtubeSubs") SELECT "contractStatus", "createdAt", "email", coalesce("facebookFans", 0) AS "facebookFans", "id", coalesce("instagramFollowers", 0) AS "instagramFollowers", "lastFollowUp", "name", "nextFollowUp", "notes", "region", "status", coalesce("tiktokFollowers", 0) AS "tiktokFollowers", "updatedAt", coalesce("youtubeSubs", 0) AS "youtubeSubs" FROM "Influencer";
DROP TABLE "Influencer";
ALTER TABLE "new_Influencer" RENAME TO "Influencer";
CREATE INDEX "Influencer_shopId_idx" ON "Influencer"("shopId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shop_key" ON "Shop"("shop");
