-- CreateTable
CREATE TABLE "Influencer" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Influencer_shop_idx" ON "Influencer"("shop");
