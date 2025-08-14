/*
  Warnings:

  - Made the column `distance` on table `race_results` required. This step will fail if there are existing NULL values in that column.
  - Made the column `time` on table `race_results` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `profiles` MODIFY `sportLevel` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE', 'EXPERT') NULL;

-- AlterTable
ALTER TABLE `race_results` MODIFY `distance` DOUBLE NOT NULL,
    MODIFY `time` VARCHAR(15) NOT NULL;
