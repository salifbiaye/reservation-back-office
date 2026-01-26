/*
  Warnings:

  - You are about to drop the column `capacity` on the `Location` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "capacity",
ADD COLUMN     "maxDurationHours" INTEGER;

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "description" DROP NOT NULL;
