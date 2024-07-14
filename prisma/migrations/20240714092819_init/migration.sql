-- AlterTable
ALTER TABLE `token` ADD COLUMN `telegramId` VARCHAR(191) NULL,
    MODIFY `token` TEXT NULL;
