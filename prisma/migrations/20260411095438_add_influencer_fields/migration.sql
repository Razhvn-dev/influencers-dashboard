-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Influencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "contractStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "lastFollowUp" DATETIME,
    "nextFollowUp" DATETIME,
    "youtubeSubs" INTEGER DEFAULT 0,
    "facebookFans" INTEGER DEFAULT 0,
    "instagramFollowers" INTEGER DEFAULT 0,
    "tiktokFollowers" INTEGER DEFAULT 0,
    "collaborationStatus" TEXT NOT NULL DEFAULT 'APPLIED',
    "ambassadorLevel" TEXT NOT NULL DEFAULT 'NONE',
    "youtubeUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "websiteUrl" TEXT,
    "productRequested" TEXT,
    "specialDeliveryRequirements" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Influencer" ("companyName", "contractStatus", "createdAt", "email", "facebookFans", "id", "instagramFollowers", "lastFollowUp", "name", "nextFollowUp", "notes", "region", "shop", "status", "tiktokFollowers", "updatedAt", "youtubeSubs") SELECT "companyName", "contractStatus", "createdAt", "email", "facebookFans", "id", "instagramFollowers", "lastFollowUp", "name", "nextFollowUp", "notes", "region", "shop", "status", "tiktokFollowers", "updatedAt", "youtubeSubs" FROM "Influencer";
DROP TABLE "Influencer";
ALTER TABLE "new_Influencer" RENAME TO "Influencer";
CREATE INDEX "Influencer_shop_idx" ON "Influencer"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
