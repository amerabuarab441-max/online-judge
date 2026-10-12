-- AlterTable
ALTER TABLE "ContestParticipant" ADD COLUMN     "isVirtual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "virtualStartTime" TIMESTAMP(3);
