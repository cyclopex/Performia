-- Inizializzazione database Performia
-- Questo file viene eseguito automaticamente quando il container MariaDB viene avviato per la prima volta

-- Creazione database (se non esiste già)
CREATE DATABASE IF NOT EXISTS performia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Uso del database
USE performia;

-- Creazione utente con permessi (se non esiste già)
-- CREATE USER IF NOT EXISTS 'performia_user'@'%' IDENTIFIED BY 'your_secure_password';
-- GRANT ALL PRIVILEGES ON performia.* TO 'performia_user'@'%';
-- FLUSH PRIVILEGES;

-- Commento: Le tabelle verranno create automaticamente da Prisma
-- quando eseguirai: npx prisma db push
