-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "externalSource" TEXT,
ADD COLUMN     "externalUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_externalUrl_key" ON "Post"("externalUrl");

-- CreateIndex
CREATE INDEX "Post_externalSource_createdAt_idx" ON "Post"("externalSource", "createdAt" DESC);

