-- CreateIndex
CREATE INDEX "ProcessedGame_name_idx" ON "ProcessedGame"("name");

-- CreateIndex
CREATE INDEX "ProcessedGame_shortDescription_idx" ON "ProcessedGame"("shortDescription");

-- CreateIndex
CREATE INDEX "ProcessedGame_type_requiredAge_idx" ON "ProcessedGame"("type", "requiredAge");

-- CreateIndex
CREATE INDEX "ProcessedGame_voteCount_idx" ON "ProcessedGame"("voteCount");
