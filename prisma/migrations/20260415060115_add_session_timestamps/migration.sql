/*
  Warnings:

  - You are about to drop the `CommunicationLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `companyName` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `contractValue` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `facebookFans` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `followUpNotes` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `lastFollowUp` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `nextFollowUp` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `promisedProducts` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeSubs` on the `Influencer` table. All the data in the column will be lost.
  - You are about to alter the column `ambassadorLevel` on the `Influencer` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `accountOwner` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `collaborator` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `shop` on the `Shop` table. All the data in the column will be lost.
  - Added the required column `company` to the `Influencer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Influencer` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Influencer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CommunicationLog_shopId_idx";

-- DropIndex
DROP INDEX "CommunicationLog_influencerId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CommunicationLog";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Influencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "youtubeUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "youtubeFollowers" INTEGER NOT NULL DEFAULT 0,
    "facebookFollowers" INTEGER NOT NULL DEFAULT 0,
    "instagramFollowers" INTEGER NOT NULL DEFAULT 0,
    "tiktokFollowers" INTEGER NOT NULL DEFAULT 0,
    "totalFollowers" INTEGER NOT NULL DEFAULT 0,
    "ambassadorLevel" INTEGER NOT NULL DEFAULT 1,
    "collaborationStatus" TEXT NOT NULL DEFAULT '未申请',
    "notes" TEXT,
    "contractStatus" TEXT,
    "productsOffered" TEXT,
    "deliverables" TEXT,
    "lastContactDate" DATETIME,
    "nextFollowUpDate" DATETIME,
    "specialRequirements" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shopId" TEXT NOT NULL,
    CONSTRAINT "Influencer_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Influencer" ("ambassadorLevel", "contractStatus", "createdAt", "deliverables", "email", "facebookUrl", "id", "instagramFollowers", "instagramUrl", "name", "notes", "shopId", "tiktokFollowers", "tiktokUrl", "totalFollowers", "updatedAt", "youtubeUrl") SELECT "ambassadorLevel", "contractStatus", "createdAt", "deliverables", "email", "facebookUrl", "id", "instagramFollowers", "instagramUrl", "name", "notes", "shopId", "tiktokFollowers", "tiktokUrl", "totalFollowers", "updatedAt", "youtubeUrl" FROM "Influencer";
DROP TABLE "Influencer";
ALTER TABLE "new_Influencer" RENAME TO "Influencer";
CREATE INDEX "Influencer_shopId_idx" ON "Influencer"("shopId");
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" TEXT,
    "scope" TEXT,
    "expires" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Session" ("accessToken", "expires", "id", "isOnline", "scope", "shop", "state") SELECT "accessToken", "expires", "id", "isOnline", "scope", "shop", "state" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_shop_state_key" ON "Session"("shop", "state");
CREATE TABLE "new_Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Shop" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
