/*
  Warnings:

  - You are about to drop the column `time` on the `scheduled_activities` table. All the data in the column will be lost.
  - Added the required column `startTime` to the `scheduled_activities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scheduled_activities` DROP COLUMN `time`,
    ADD COLUMN `startTime` VARCHAR(10) NOT NULL;
