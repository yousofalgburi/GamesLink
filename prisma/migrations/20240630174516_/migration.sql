-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UP', 'DOWN');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "credits" INTEGER NOT NULL DEFAULT 5,
    "username" TEXT,
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SteamGame" (
    "id" SERIAL NOT NULL,
    "steamAppId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "shortDescription" VARCHAR(1000) NOT NULL,
    "headerImage" VARCHAR(1000) NOT NULL,
    "requiredAge" INTEGER NOT NULL,
    "isFree" BOOLEAN NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "developers" TEXT[],
    "categories" TEXT[],
    "genres" TEXT[],
    "voteCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SteamGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "userId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" "VoteType" NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("userId","gameId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "replyToId" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "commentId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("userId","commentId")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "queuedUsers" TEXT[],
    "allowedUsers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "loaded" BOOLEAN NOT NULL DEFAULT false,
    "loadedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("appId")
);

-- CreateTable
CREATE TABLE "ProcessedGame" (
    "id" SERIAL NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "requiredAge" INTEGER NOT NULL,
    "isFree" BOOLEAN NOT NULL,
    "dlc" INTEGER[],
    "detailedDescription" TEXT NOT NULL,
    "aboutTheGame" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "supportedLanguages" TEXT NOT NULL,
    "reviews" TEXT,
    "headerImage" TEXT NOT NULL,
    "capsuleImage" TEXT NOT NULL,
    "capsuleImagev5" TEXT NOT NULL,
    "website" TEXT,
    "developers" TEXT[],
    "publishers" TEXT[],
    "recommendations" INTEGER,
    "background" TEXT NOT NULL,
    "backgroundRaw" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "releaseDateId" INTEGER NOT NULL,
    "supportInfoId" INTEGER NOT NULL,

    CONSTRAINT "ProcessedGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "windows" BOOLEAN NOT NULL,
    "mac" BOOLEAN NOT NULL,
    "linux" BOOLEAN NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseDate" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "comingSoon" BOOLEAN NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "ReleaseDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportInfo" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "url" TEXT,
    "email" TEXT,

    CONSTRAINT "SupportInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentDescriptors" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "ids" INTEGER[],
    "notes" TEXT,

    CONSTRAINT "ContentDescriptors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceOverview" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "initial" INTEGER NOT NULL,
    "final" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "initialFormatted" TEXT NOT NULL,
    "finalFormatted" TEXT NOT NULL,

    CONSTRAINT "PriceOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemRequirements" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "minimum" TEXT NOT NULL,
    "recommended" TEXT,

    CONSTRAINT "SystemRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCategory" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "GameCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameGenre" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "genreId" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "GameGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Screenshot" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "screenshotId" INTEGER NOT NULL,
    "pathThumbnail" TEXT NOT NULL,
    "pathFull" TEXT NOT NULL,

    CONSTRAINT "Screenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "webm480" TEXT NOT NULL,
    "webmMax" TEXT NOT NULL,
    "mp4480" TEXT NOT NULL,
    "mp4Max" TEXT NOT NULL,
    "highlight" BOOLEAN NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "ratingGenerated" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "requiredAge" TEXT NOT NULL,
    "banned" TEXT NOT NULL,
    "useAgeGate" TEXT NOT NULL,
    "descriptors" TEXT,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
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
CREATE UNIQUE INDEX "SteamGame_steamAppId_key" ON "SteamGame"("steamAppId");

-- CreateIndex
CREATE INDEX "SteamGame_name_categories_genres_idx" ON "SteamGame"("name", "categories", "genres");

-- CreateIndex
CREATE INDEX "Friendship_friendId_idx" ON "Friendship"("friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomId_key" ON "Room"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_appId_key" ON "Game"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedGame_appId_key" ON "ProcessedGame"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedGame_releaseDateId_key" ON "ProcessedGame"("releaseDateId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedGame_supportInfoId_key" ON "ProcessedGame"("supportInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_gameId_key" ON "Platform"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseDate_gameId_key" ON "ReleaseDate"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportInfo_gameId_key" ON "SupportInfo"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentDescriptors_gameId_key" ON "ContentDescriptors"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceOverview_gameId_key" ON "PriceOverview"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemRequirements_gameId_type_key" ON "SystemRequirements"("gameId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "GameCategory_gameId_categoryId_key" ON "GameCategory"("gameId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "GameGenre_gameId_genreId_key" ON "GameGenre"("gameId", "genreId");

-- CreateIndex
CREATE UNIQUE INDEX "Screenshot_gameId_screenshotId_key" ON "Screenshot"("gameId", "screenshotId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_gameId_movieId_key" ON "Movie"("gameId", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_gameId_name_key" ON "Achievement"("gameId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_gameId_source_key" ON "Rating"("gameId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomMembers_AB_unique" ON "_RoomMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomMembers_B_index" ON "_RoomMembers"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "SteamGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "SteamGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedGame" ADD CONSTRAINT "ProcessedGame_releaseDateId_fkey" FOREIGN KEY ("releaseDateId") REFERENCES "ReleaseDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedGame" ADD CONSTRAINT "ProcessedGame_supportInfoId_fkey" FOREIGN KEY ("supportInfoId") REFERENCES "SupportInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDescriptors" ADD CONSTRAINT "ContentDescriptors_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverview" ADD CONSTRAINT "PriceOverview_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemRequirements" ADD CONSTRAINT "SystemRequirements_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameGenre" ADD CONSTRAINT "GameGenre_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screenshot" ADD CONSTRAINT "Screenshot_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomMembers" ADD CONSTRAINT "_RoomMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomMembers" ADD CONSTRAINT "_RoomMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
