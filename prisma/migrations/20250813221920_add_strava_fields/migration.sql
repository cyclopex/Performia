/*
  Warnings:

  - You are about to alter the column `raceType` on the `race_results` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(16))` to `VarChar(50)`.
  - You are about to drop the column `startTime` on the `scheduled_activities` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `workouts` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(22))` to `VarChar(191)`.
  - Made the column `distance` on table `race_results` required. This step will fail if there are existing NULL values in that column.
  - Made the column `time` on table `race_results` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `time` to the `scheduled_activities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `race_results` MODIFY `distance` DOUBLE NOT NULL,
    MODIFY `time` VARCHAR(15) NOT NULL,
    MODIFY `raceType` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `scheduled_activities` DROP COLUMN `startTime`,
    ADD COLUMN `time` VARCHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE `workouts` ADD COLUMN `stravaData` TEXT NULL,
    ADD COLUMN `stravaId` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'COMPLETED';

-- CreateIndex
CREATE INDEX `workouts_stravaId_idx` ON `workouts`(`stravaId`);
