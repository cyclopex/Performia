-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `accounts_userId_idx`(`userId`),
    UNIQUE INDEX `accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
    INDEX `sessions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NULL,
    `email` VARCHAR(255) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` TEXT NULL,
    `password` VARCHAR(255) NULL,
    `role` ENUM('ATHLETE', 'COACH', 'PROFESSIONAL', 'ADMIN') NOT NULL DEFAULT 'ATHLETE',
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `timezone` VARCHAR(50) NULL DEFAULT 'Europe/Rome',
    `language` VARCHAR(10) NULL DEFAULT 'it',
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_isActive_idx`(`isActive`),
    INDEX `users_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bio` TEXT NULL,
    `location` VARCHAR(100) NULL,
    `birthDate` DATETIME(3) NULL,
    `phone` VARCHAR(20) NULL,
    `website` VARCHAR(255) NULL,
    `specializations` TEXT NULL,
    `experience` TEXT NULL,
    `certifications` TEXT NULL,
    `achievements` TEXT NULL,
    `socialLinks` TEXT NULL,
    `avatar` TEXT NULL,
    `coverImage` TEXT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `preferences` TEXT NULL,
    `height` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL,
    `dominantHand` ENUM('RIGHT', 'LEFT', 'AMBIDEXTROUS') NULL,
    `sports` TEXT NULL,
    `sportLevel` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE') NULL,
    `yearsExperience` INTEGER NULL,
    `sportGoals` ENUM('RECREATIONAL', 'COMPETITIVE', 'PROFESSIONAL') NULL,
    `trainingAvailability` TEXT NULL,
    `trainingFrequency` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_userId_key`(`userId`),
    INDEX `profiles_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `connections` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `connectedUserId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `requestMessage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `connections_userId_idx`(`userId`),
    INDEX `connections_connectedUserId_idx`(`connectedUserId`),
    INDEX `connections_status_idx`(`status`),
    UNIQUE INDEX `connections_userId_connectedUserId_key`(`userId`, `connectedUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workouts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NOT NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `distance` DOUBLE NULL,
    `calories` INTEGER NULL,
    `rpe` INTEGER NULL,
    `heartRateAvg` INTEGER NULL,
    `heartRateMax` INTEGER NULL,
    `pace` VARCHAR(20) NULL,
    `elevation` INTEGER NULL,
    `weather` TEXT NULL,
    `equipment` TEXT NULL,
    `splits` TEXT NULL,
    `notes` TEXT NULL,
    `type` ENUM('RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'YOGA', 'PILATES', 'CROSSFIT', 'MARTIAL_ARTS', 'CLIMBING', 'OTHER') NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `tags` TEXT NULL,
    `location` VARCHAR(200) NULL,
    `gpsData` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `assignedBy` VARCHAR(191) NULL,

    INDEX `workouts_userId_date_idx`(`userId`, `date`),
    INDEX `workouts_type_idx`(`type`),
    INDEX `workouts_date_idx`(`date`),
    INDEX `workouts_isPublic_idx`(`isPublic`),
    INDEX `workouts_assignedBy_idx`(`assignedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `race_results` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `raceName` VARCHAR(200) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `distance` DOUBLE NULL,
    `time` VARCHAR(15) NOT NULL,
    `pace` VARCHAR(15) NULL,
    `position` INTEGER NULL,
    `totalParticipants` INTEGER NULL,
    `category` VARCHAR(100) NULL,
    `ageGroup` VARCHAR(50) NULL,
    `location` VARCHAR(200) NULL,
    `raceType` VARCHAR(50) NULL,
    `personalBest` BOOLEAN NOT NULL DEFAULT false,
    `seasonBest` BOOLEAN NOT NULL DEFAULT false,
    `weather` TEXT NULL,
    `elevation` INTEGER NULL,
    `splits` TEXT NULL,
    `notes` TEXT NULL,
    `certificate` TEXT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `race_results_userId_date_idx`(`userId`, `date`),
    INDEX `race_results_date_idx`(`date`),
    INDEX `race_results_personalBest_idx`(`personalBest`),
    INDEX `race_results_seasonBest_idx`(`seasonBest`),
    INDEX `race_results_verified_idx`(`verified`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anthropometric_data` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `weight` DOUBLE NULL,
    `height` DOUBLE NULL,
    `bodyFat` DOUBLE NULL,
    `muscleMass` DOUBLE NULL,
    `bmi` DOUBLE NULL,
    `restingHR` INTEGER NULL,
    `maxHR` INTEGER NULL,
    `vo2Max` DOUBLE NULL,
    `hydration` DOUBLE NULL,
    `bloodPressure` VARCHAR(20) NULL,
    `bodyTemp` DOUBLE NULL,
    `notes` TEXT NULL,
    `measuredBy` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `anthropometric_data_userId_date_idx`(`userId`, `date`),
    INDEX `anthropometric_data_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'eur',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `stripePaymentIntentId` VARCHAR(255) NULL,
    `plan` ENUM('FREE', 'PRO', 'PREMIUM', 'ENTERPRISE') NOT NULL,
    `description` VARCHAR(500) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_stripePaymentIntentId_key`(`stripePaymentIntentId`),
    INDEX `payments_userId_idx`(`userId`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_createdAt_idx`(`createdAt`),
    INDEX `payments_plan_idx`(`plan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chats` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('DIRECT', 'GROUP', 'SUPPORT', 'ANNOUNCEMENT') NOT NULL DEFAULT 'DIRECT',
    `name` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `avatar` TEXT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chats_type_idx`(`type`),
    INDEX `chats_createdAt_idx`(`createdAt`),
    INDEX `chats_isArchived_idx`(`isArchived`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_participants` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MODERATOR', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leftAt` DATETIME(3) NULL,
    `lastReadAt` DATETIME(3) NULL,
    `isMuted` BOOLEAN NOT NULL DEFAULT false,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,

    INDEX `chat_participants_userId_idx`(`userId`),
    INDEX `chat_participants_chatId_idx`(`chatId`),
    UNIQUE INDEX `chat_participants_chatId_userId_key`(`chatId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'text',
    `fileUrl` TEXT NULL,
    `fileName` VARCHAR(255) NULL,
    `fileSize` INTEGER NULL,
    `status` ENUM('SENT', 'DELIVERED', 'READ') NOT NULL DEFAULT 'SENT',
    `isEdited` BOOLEAN NOT NULL DEFAULT false,
    `editedAt` DATETIME(3) NULL,
    `replyToId` VARCHAR(191) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,

    INDEX `messages_chatId_createdAt_idx`(`chatId`, `createdAt`),
    INDEX `messages_senderId_idx`(`senderId`),
    INDEX `messages_replyToId_idx`(`replyToId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheduled_activities` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(10) NOT NULL,
    `duration` INTEGER NOT NULL,
    `type` ENUM('WORKOUT', 'THERAPY', 'NUTRITION', 'MENTAL', 'ASSESSMENT', 'RECOVERY', 'MEETING', 'CUSTOM') NOT NULL,
    `assignedBy` VARCHAR(191) NULL,
    `assignedTo` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED') NOT NULL DEFAULT 'SCHEDULED',
    `tags` TEXT NULL,
    `location` VARCHAR(200) NULL,
    `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    `recurrence` TEXT NULL,
    `reminders` TEXT NULL,
    `notes` TEXT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `scheduled_activities_userId_date_idx`(`userId`, `date`),
    INDEX `scheduled_activities_assignedBy_idx`(`assignedBy`),
    INDEX `scheduled_activities_assignedTo_idx`(`assignedTo`),
    INDEX `scheduled_activities_date_status_idx`(`date`, `status`),
    INDEX `scheduled_activities_type_idx`(`type`),
    INDEX `scheduled_activities_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_proposals` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('ACTIVITY', 'WORKOUT', 'MODIFICATION', 'DELETION') NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `status` ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `activityType` ENUM('WORKOUT', 'THERAPY', 'NUTRITION', 'MENTAL', 'ASSESSMENT', 'RECOVERY', 'MEETING', 'CUSTOM') NOT NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `location` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `proposedById` VARCHAR(191) NOT NULL,
    `proposedForId` VARCHAR(191) NOT NULL,
    `originalActivityId` VARCHAR(191) NULL,
    `originalActivityType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `respondedAt` DATETIME(3) NULL,
    `responseNotes` TEXT NULL,

    INDEX `activity_proposals_proposedById_idx`(`proposedById`),
    INDEX `activity_proposals_proposedForId_idx`(`proposedForId`),
    INDEX `activity_proposals_status_idx`(`status`),
    INDEX `activity_proposals_type_idx`(`type`),
    INDEX `activity_proposals_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_proposals` (
    `id` VARCHAR(191) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `status` ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'YOGA', 'PILATES', 'CROSSFIT', 'MARTIAL_ARTS', 'CLIMBING', 'OTHER') NOT NULL,
    `duration` INTEGER NULL,
    `intensity` VARCHAR(50) NULL,
    `exercises` TEXT NULL,
    `notes` TEXT NULL,
    `proposedById` VARCHAR(191) NOT NULL,
    `proposedForId` VARCHAR(191) NOT NULL,
    `originalWorkoutId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `respondedAt` DATETIME(3) NULL,
    `responseNotes` TEXT NULL,

    INDEX `workout_proposals_proposedById_idx`(`proposedById`),
    INDEX `workout_proposals_proposedForId_idx`(`proposedForId`),
    INDEX `workout_proposals_status_idx`(`status`),
    INDEX `workout_proposals_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `connections` ADD CONSTRAINT `connections_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `connections` ADD CONSTRAINT `connections_connectedUserId_fkey` FOREIGN KEY (`connectedUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workouts` ADD CONSTRAINT `workouts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workouts` ADD CONSTRAINT `workouts_assignedBy_fkey` FOREIGN KEY (`assignedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `race_results` ADD CONSTRAINT `race_results_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anthropometric_data` ADD CONSTRAINT `anthropometric_data_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_participants` ADD CONSTRAINT `chat_participants_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_participants` ADD CONSTRAINT `chat_participants_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_activities` ADD CONSTRAINT `scheduled_activities_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_activities` ADD CONSTRAINT `scheduled_activities_assignedBy_fkey` FOREIGN KEY (`assignedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_activities` ADD CONSTRAINT `scheduled_activities_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_proposals` ADD CONSTRAINT `activity_proposals_proposedById_fkey` FOREIGN KEY (`proposedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_proposals` ADD CONSTRAINT `activity_proposals_proposedForId_fkey` FOREIGN KEY (`proposedForId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_proposals` ADD CONSTRAINT `workout_proposals_proposedById_fkey` FOREIGN KEY (`proposedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_proposals` ADD CONSTRAINT `workout_proposals_proposedForId_fkey` FOREIGN KEY (`proposedForId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
