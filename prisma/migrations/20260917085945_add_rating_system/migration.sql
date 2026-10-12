-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "ratingsCalculated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ContestParticipant" ADD COLUMN     "ratingChange" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 1500;
