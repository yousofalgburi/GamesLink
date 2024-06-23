-- CreateTable
CREATE TABLE "Game" (
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "loaded" BOOLEAN NOT NULL DEFAULT false,
    "loadedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("appId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");
