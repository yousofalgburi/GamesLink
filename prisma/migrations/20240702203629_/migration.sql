-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "gameInteractionId" INTEGER;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "gameInteractionId" INTEGER;

-- CreateTable
CREATE TABLE "GameInteraction" (
    "id" SERIAL NOT NULL,
    "appId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GameInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameInteraction_appId_key" ON "GameInteraction"("appId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_gameInteractionId_fkey" FOREIGN KEY ("gameInteractionId") REFERENCES "GameInteraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_gameInteractionId_fkey" FOREIGN KEY ("gameInteractionId") REFERENCES "GameInteraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
