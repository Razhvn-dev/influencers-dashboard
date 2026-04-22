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
    "ambassadorLevel" TEXT NOT NULL DEFAULT 'NONE',
    "collaborationStatus" TEXT NOT NULL DEFAULT 'APPLIED',
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
INSERT INTO "new_Influencer" ("ambassadorLevel", "collaborationStatus", "company", "contractStatus", "createdAt", "deliverables", "email", "facebookFollowers", "facebookUrl", "id", "instagramFollowers", "instagramUrl", "lastContactDate", "location", "name", "nextFollowUpDate", "notes", "productsOffered", "shopId", "specialRequirements", "tiktokFollowers", "tiktokUrl", "totalFollowers", "updatedAt", "youtubeFollowers", "youtubeUrl") SELECT "ambassadorLevel", "collaborationStatus", "company", "contractStatus", "createdAt", "deliverables", "email", "facebookFollowers", "facebookUrl", "id", "instagramFollowers", "instagramUrl", "lastContactDate", "location", "name", "nextFollowUpDate", "notes", "productsOffered", "shopId", "specialRequirements", "tiktokFollowers", "tiktokUrl", "totalFollowers", "updatedAt", "youtubeFollowers", "youtubeUrl" FROM "Influencer";
DROP TABLE "Influencer";
ALTER TABLE "new_Influencer" RENAME TO "Influencer";
CREATE INDEX "Influencer_shopId_idx" ON "Influencer"("shopId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
