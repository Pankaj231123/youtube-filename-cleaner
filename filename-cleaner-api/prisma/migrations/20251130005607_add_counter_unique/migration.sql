/*
  Warnings:

  - A unique constraint covering the columns `[userId,niche]` on the table `EpisodeCounter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EpisodeCounter_userId_niche_key" ON "EpisodeCounter"("userId", "niche");
