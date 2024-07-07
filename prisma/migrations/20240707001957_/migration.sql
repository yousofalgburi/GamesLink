/*
  Warnings:

  - You are about to drop the `GameInteraction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GameInteraction";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "replyToId" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "commentId" TEXT,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_Comment" ("authorId", "commentId", "createdAt", "gameId", "id", "replyToId", "text", "voteCount") SELECT "authorId", "commentId", "createdAt", "gameId", "id", "replyToId", "text", "voteCount" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
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
INSERT INTO "new_ProcessedGame" ("aboutTheGame", "additionalData", "appId", "background", "backgroundRaw", "capsuleImage", "capsuleImagev5", "controllerSupport", "createdAt", "detailedDescription", "developers", "dlc", "extUserAccountNotice", "fullgame", "headerImage", "id", "isFree", "legalNotice", "name", "packages", "platformId", "publishers", "recommendations", "requiredAge", "reviews", "shortDescription", "steamAppid", "supportedLanguages", "type", "updatedAt", "website") SELECT "aboutTheGame", "additionalData", "appId", "background", "backgroundRaw", "capsuleImage", "capsuleImagev5", "controllerSupport", "createdAt", "detailedDescription", "developers", "dlc", "extUserAccountNotice", "fullgame", "headerImage", "id", "isFree", "legalNotice", "name", "packages", "platformId", "publishers", "recommendations", "requiredAge", "reviews", "shortDescription", "steamAppid", "supportedLanguages", "type", "updatedAt", "website" FROM "ProcessedGame";
DROP TABLE "ProcessedGame";
ALTER TABLE "new_ProcessedGame" RENAME TO "ProcessedGame";
CREATE UNIQUE INDEX "ProcessedGame_appId_key" ON "ProcessedGame"("appId");
CREATE TABLE "new_Vote" (
    "userId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    PRIMARY KEY ("userId", "gameId"),
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("gameId", "type", "userId") SELECT "gameId", "type", "userId" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
