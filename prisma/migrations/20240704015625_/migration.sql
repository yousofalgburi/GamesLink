-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "credits" INTEGER NOT NULL DEFAULT 5,
    "username" TEXT,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Vote" (
    "userId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    PRIMARY KEY ("userId", "gameId"),
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInteraction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "replyToId" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "commentId" TEXT,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInteraction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    PRIMARY KEY ("userId", "commentId"),
    CONSTRAINT "CommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FriendRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FriendRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "queuedUsers" TEXT NOT NULL,
    "allowedUsers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Game" (
    "appId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "loaded" BOOLEAN NOT NULL DEFAULT false,
    "loadedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GameInteraction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ProcessedGame" (
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
    CONSTRAINT "ProcessedGame_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "windows" BOOLEAN NOT NULL,
    "mac" BOOLEAN NOT NULL,
    "linux" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "PcRequirements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "minimum" TEXT NOT NULL,
    "recommended" TEXT,
    CONSTRAINT "PcRequirements_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MacRequirements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "minimum" TEXT NOT NULL,
    "recommended" TEXT,
    CONSTRAINT "MacRequirements_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LinuxRequirements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "minimum" TEXT NOT NULL,
    "recommended" TEXT,
    CONSTRAINT "LinuxRequirements_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReleaseDate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "comingSoon" BOOLEAN NOT NULL,
    "date" TEXT NOT NULL,
    CONSTRAINT "ReleaseDate_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "url" TEXT,
    "email" TEXT,
    CONSTRAINT "SupportInfo_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentDescriptors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "ids" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "ContentDescriptors_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceOverview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "initial" INTEGER NOT NULL,
    "final" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "initialFormatted" TEXT NOT NULL,
    "finalFormatted" TEXT NOT NULL,
    CONSTRAINT "PriceOverview_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PackageGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "selectionText" TEXT NOT NULL,
    "saveText" TEXT,
    "displayType" INTEGER NOT NULL,
    "isRecurringSubscription" TEXT NOT NULL,
    CONSTRAINT "PackageGroup_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sub" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "packageGroupId" INTEGER NOT NULL,
    "packageid" INTEGER NOT NULL,
    "percentSavingsText" TEXT,
    "percentSavings" INTEGER NOT NULL,
    "optionText" TEXT NOT NULL,
    "optionDescription" TEXT,
    "canGetFreeLicense" TEXT NOT NULL,
    "isFreeLicense" BOOLEAN NOT NULL,
    "priceInCentsWithDiscount" INTEGER NOT NULL,
    CONSTRAINT "Sub_packageGroupId_fkey" FOREIGN KEY ("packageGroupId") REFERENCES "PackageGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "GameCategory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameGenre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "GameGenre_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Screenshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "pathThumbnail" TEXT NOT NULL,
    "pathFull" TEXT NOT NULL,
    CONSTRAINT "Screenshot_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "webm" TEXT NOT NULL,
    "mp4" TEXT NOT NULL,
    "highlight" BOOLEAN NOT NULL,
    CONSTRAINT "Movie_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    CONSTRAINT "Achievement_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "ratingGenerated" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "requiredAge" TEXT NOT NULL,
    "banned" TEXT NOT NULL,
    "useAgeGate" TEXT NOT NULL,
    "descriptors" TEXT,
    CONSTRAINT "Rating_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Demo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appid" INTEGER NOT NULL,
    "description" TEXT,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "Demo_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metacritic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT,
    "score" INTEGER,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "Metacritic_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RoomMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoomMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoomMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Friendship_friendId_idx" ON "Friendship"("friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomId_key" ON "Room"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_appId_key" ON "Game"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "GameInteraction_appId_key" ON "GameInteraction"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedGame_appId_key" ON "ProcessedGame"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "PcRequirements_gameId_key" ON "PcRequirements"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "MacRequirements_gameId_key" ON "MacRequirements"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "LinuxRequirements_gameId_key" ON "LinuxRequirements"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseDate_gameId_key" ON "ReleaseDate"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportInfo_gameId_key" ON "SupportInfo"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentDescriptors_gameId_key" ON "ContentDescriptors"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceOverview_gameId_key" ON "PriceOverview"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameCategory_gameId_id_key" ON "GameCategory"("gameId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "GameGenre_gameId_id_key" ON "GameGenre"("gameId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Screenshot_gameId_id_key" ON "Screenshot"("gameId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_gameId_id_key" ON "Movie"("gameId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_gameId_source_key" ON "Rating"("gameId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "Demo_gameId_appid_key" ON "Demo"("gameId", "appid");

-- CreateIndex
CREATE UNIQUE INDEX "Metacritic_gameId_key" ON "Metacritic"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomMembers_AB_unique" ON "_RoomMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomMembers_B_index" ON "_RoomMembers"("B");
