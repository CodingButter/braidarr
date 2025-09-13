-- CreateTable
CREATE TABLE "Indexer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKey" TEXT,
    "categories" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 25,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QualityProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cutoff" INTEGER NOT NULL,
    "items" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RootFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "name" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "freeSpace" BIGINT,
    "totalSpace" BIGINT,
    "lastScan" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DownloadClient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "category" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Indexer_type_idx" ON "Indexer"("type");

-- CreateIndex
CREATE INDEX "Indexer_isEnabled_idx" ON "Indexer"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "QualityProfile_name_key" ON "QualityProfile"("name");

-- CreateIndex
CREATE INDEX "QualityProfile_isDefault_idx" ON "QualityProfile"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "RootFolder_path_key" ON "RootFolder"("path");

-- CreateIndex
CREATE INDEX "RootFolder_isDefault_idx" ON "RootFolder"("isDefault");

-- CreateIndex
CREATE INDEX "DownloadClient_type_idx" ON "DownloadClient"("type");

-- CreateIndex
CREATE INDEX "DownloadClient_isEnabled_idx" ON "DownloadClient"("isEnabled");

-- CreateIndex
CREATE INDEX "DownloadClient_priority_idx" ON "DownloadClient"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE INDEX "SystemSettings_category_idx" ON "SystemSettings"("category");
