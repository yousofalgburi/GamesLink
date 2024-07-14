/*
  Warnings:

  - You are about to drop the column `categoriesList` on the `ProcessedGame` table. All the data in the column will be lost.
  - You are about to drop the column `genresList` on the `ProcessedGame` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProcessedGame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "requiredAge" INTEGER NOT NULL,
    "isFree" BOOLEAN NOT NULL,
    "dlc" TEXT NOT NULL,
    "detailedDescription" TEXT NOT NULL,
    "aboutTheGame" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "supportedLanguages" TEXT NOT NULL,
    "reviews" TEXT,
    "headerImage" TEXT NOT NULL,
    "capsuleImage" TEXT NOT NULL,
    "capsuleImagev5" TEXT NOT NULL,
    "website" TEXT,
    "developers" TEXT NOT NULL,
    "publishers" TEXT NOT NULL,
    "recommendations" INTEGER,
    "background" TEXT NOT NULL,
    "backgroundRaw" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "packages" TEXT NOT NULL,
    "extUserAccountNotice" TEXT,
    "platformId" INTEGER NOT NULL,
    "legalNotice" TEXT,
    "controllerSupport" TEXT,
    "fullgame" TEXT,
    "steamAppid" INTEGER,
    "additionalData" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProcessedGame_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProcessedGame" ("aboutTheGame", "additionalData", "appId", "background", "backgroundRaw", "capsuleImage", "capsuleImagev5", "controllerSupport", "createdAt", "detailedDescription", "developers", "dlc", "extUserAccountNotice", "fullgame", "headerImage", "id", "isFree", "legalNotice", "name", "packages", "platformId", "publishers", "recommendations", "requiredAge", "reviews", "shortDescription", "steamAppid", "supportedLanguages", "type", "updatedAt", "voteCount", "website") SELECT "aboutTheGame", "additionalData", "appId", "background", "backgroundRaw", "capsuleImage", "capsuleImagev5", "controllerSupport", "createdAt", "detailedDescription", "developers", "dlc", "extUserAccountNotice", "fullgame", "headerImage", "id", "isFree", "legalNotice", "name", "packages", "platformId", "publishers", "recommendations", "requiredAge", "reviews", "shortDescription", "steamAppid", "supportedLanguages", "type", "updatedAt", "voteCount", "website" FROM "ProcessedGame";
DROP TABLE "ProcessedGame";
ALTER TABLE "new_ProcessedGame" RENAME TO "ProcessedGame";
CREATE UNIQUE INDEX "ProcessedGame_appId_key" ON "ProcessedGame"("appId");
CREATE INDEX "ProcessedGame_type_voteCount_idx" ON "ProcessedGame"("type", "voteCount");
CREATE INDEX "ProcessedGame_name_idx" ON "ProcessedGame"("name");
CREATE INDEX "ProcessedGame_shortDescription_idx" ON "ProcessedGame"("shortDescription");
CREATE INDEX "ProcessedGame_voteCount_idx" ON "ProcessedGame"("voteCount");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
