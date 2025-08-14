/*
  Warnings:

  - Made the column `raceType` on table `race_results` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `race_results` MODIFY `distance` DOUBLE NULL,
    MODIFY `time` VARCHAR(15) NULL,
    MODIFY `raceType` ENUM('RACE', 'COMPETITION', 'TIME_TRIAL', 'FUN_RUN') NOT NULL DEFAULT 'RACE';

-- AlterTable
ALTER TABLE `workouts` ADD COLUMN `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED';
