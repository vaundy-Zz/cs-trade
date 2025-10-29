-- CreateEnum
CREATE TYPE "PriceInterval" AS ENUM ('HOURLY', 'FOUR_HOURLY', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PRICE_THRESHOLD', 'PERCENT_CHANGE', 'VOLUME_SPIKE', 'VOLATILITY');

-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('ABOVE', 'BELOW', 'INCREASES_BY_PERCENT', 'DECREASES_BY_PERCENT');

-- CreateTable
CREATE TABLE "RarityTier" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RarityTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "baseUrl" TEXT,
    "description" TEXT,
    "contactEmail" TEXT,
    "dataLicense" TEXT,
    "rateLimitPerMinute" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "gameTitle" TEXT NOT NULL,
    "category" TEXT,
    "rarityTierId" TEXT,
    "tradable" BOOLEAN NOT NULL DEFAULT true,
    "releasedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "region" TEXT,
    "baseCurrency" TEXT NOT NULL,
    "timezone" TEXT,
    "description" TEXT,
    "apiSourceId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "supportsSnapshots" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkinMarket" (
    "id" TEXT NOT NULL,
    "skinId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "referenceCode" TEXT,
    "listingUrl" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkinMarket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "skinMarketId" TEXT NOT NULL,
    "apiSourceId" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "volume" DECIMAL(18,4),
    "tradeCount" INTEGER,
    "lowestListing" DECIMAL(18,4),
    "highestListing" DECIMAL(18,4),
    "medianPrice" DECIMAL(18,4),
    "supply" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSeries" (
    "id" TEXT NOT NULL,
    "skinMarketId" TEXT NOT NULL,
    "apiSourceId" TEXT,
    "interval" "PriceInterval" NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "open" DECIMAL(18,4),
    "close" DECIMAL(18,4),
    "high" DECIMAL(18,4),
    "low" DECIMAL(18,4),
    "average" DECIMAL(18,4),
    "volume" DECIMAL(18,4),
    "tradeCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolatilityMetric" (
    "id" TEXT NOT NULL,
    "skinMarketId" TEXT NOT NULL,
    "apiSourceId" TEXT,
    "interval" "PriceInterval" NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "volatility" DECIMAL(18,6) NOT NULL,
    "averageTrueRange" DECIMAL(18,6),
    "standardDeviation" DECIMAL(18,6),
    "confidenceScore" DECIMAL(5,4),
    "windowSize" INTEGER NOT NULL,
    "lookbackDays" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolatilityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "hashedPassword" TEXT,
    "name" TEXT,
    "image" TEXT,
    "locale" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "expiresAt" INTEGER,
    "tokenType" TEXT,
    "scope" TEXT,
    "idToken" TEXT,
    "sessionState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skinId" TEXT,
    "skinMarketId" TEXT,
    "marketId" TEXT,
    "type" "AlertType" NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "targetValue" DECIMAL(18,4),
    "changePercent" DECIMAL(7,4),
    "lookbackWindow" "PriceInterval",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggeredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "deliveryChannel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistEntry" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "skinId" TEXT NOT NULL,
    "skinMarketId" TEXT,
    "notes" TEXT,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skinId" TEXT NOT NULL,
    "skinMarketId" TEXT,
    "marketId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "averagePrice" DECIMAL(18,4) NOT NULL,
    "totalCost" DECIMAL(18,4) NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "strategyTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RarityTier_key_key" ON "RarityTier"("key");

-- CreateIndex
CREATE INDEX "RarityTier_rank_idx" ON "RarityTier"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSource_slug_key" ON "ApiSource"("slug");

-- CreateIndex
CREATE INDEX "ApiSource_isActive_idx" ON "ApiSource"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Skin_slug_key" ON "Skin"("slug");

-- CreateIndex
CREATE INDEX "Skin_rarityTierId_idx" ON "Skin"("rarityTierId");

-- CreateIndex
CREATE INDEX "Skin_gameTitle_idx" ON "Skin"("gameTitle");

-- CreateIndex
CREATE INDEX "Skin_tradable_idx" ON "Skin"("tradable");

-- CreateIndex
CREATE UNIQUE INDEX "Market_slug_key" ON "Market"("slug");

-- CreateIndex
CREATE INDEX "Market_apiSourceId_idx" ON "Market"("apiSourceId");

-- CreateIndex
CREATE INDEX "Market_isPrimary_idx" ON "Market"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "SkinMarket_skinId_marketId_key" ON "SkinMarket"("skinId", "marketId");

-- CreateIndex
CREATE INDEX "SkinMarket_marketId_idx" ON "SkinMarket"("marketId");

-- CreateIndex
CREATE INDEX "SkinMarket_isActive_idx" ON "SkinMarket"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PriceSnapshot_skinMarketId_capturedAt_key" ON "PriceSnapshot"("skinMarketId", "capturedAt");

-- CreateIndex
CREATE INDEX "PriceSnapshot_capturedAt_idx" ON "PriceSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "PriceSnapshot_skinMarketId_capturedAt_idx" ON "PriceSnapshot"("skinMarketId", "capturedAt");

-- CreateIndex
CREATE INDEX "PriceSnapshot_apiSourceId_idx" ON "PriceSnapshot"("apiSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceSeries_skinMarketId_interval_bucketStart_key" ON "PriceSeries"("skinMarketId", "interval", "bucketStart");

-- CreateIndex
CREATE INDEX "PriceSeries_interval_bucketStart_idx" ON "PriceSeries"("interval", "bucketStart");

-- CreateIndex
CREATE INDEX "PriceSeries_apiSourceId_idx" ON "PriceSeries"("apiSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "VolatilityMetric_skinMarketId_interval_measuredAt_key" ON "VolatilityMetric"("skinMarketId", "interval", "measuredAt");

-- CreateIndex
CREATE INDEX "VolatilityMetric_interval_measuredAt_idx" ON "VolatilityMetric"("interval", "measuredAt");

-- CreateIndex
CREATE INDEX "VolatilityMetric_apiSourceId_idx" ON "VolatilityMetric"("apiSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPreference_userId_key_key" ON "SavedPreference"("userId", "key");

-- CreateIndex
CREATE INDEX "SavedPreference_key_idx" ON "SavedPreference"("key");

-- CreateIndex
CREATE INDEX "Alert_userId_isActive_idx" ON "Alert"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Alert_skinId_idx" ON "Alert"("skinId");

-- CreateIndex
CREATE INDEX "Alert_skinMarketId_idx" ON "Alert"("skinMarketId");

-- CreateIndex
CREATE INDEX "Alert_marketId_idx" ON "Alert"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_slug_key" ON "Watchlist"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_name_key" ON "Watchlist"("userId", "name");

-- CreateIndex
CREATE INDEX "Watchlist_isPrimary_idx" ON "Watchlist"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistEntry_watchlistId_skinId_skinMarketId_key" ON "WatchlistEntry"("watchlistId", "skinId", "skinMarketId");

-- CreateIndex
CREATE INDEX "WatchlistEntry_skinMarketId_idx" ON "WatchlistEntry"("skinMarketId");

-- CreateIndex
CREATE INDEX "Investment_userId_skinId_idx" ON "Investment"("userId", "skinId");

-- CreateIndex
CREATE INDEX "Investment_skinMarketId_idx" ON "Investment"("skinMarketId");

-- CreateIndex
CREATE INDEX "Investment_marketId_idx" ON "Investment"("marketId");

-- CreateIndex
CREATE INDEX "Investment_isOpen_idx" ON "Investment"("isOpen");

-- AddForeignKey
ALTER TABLE "Skin" ADD CONSTRAINT "Skin_rarityTierId_fkey" FOREIGN KEY ("rarityTierId") REFERENCES "RarityTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_apiSourceId_fkey" FOREIGN KEY ("apiSourceId") REFERENCES "ApiSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinMarket" ADD CONSTRAINT "SkinMarket_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinMarket" ADD CONSTRAINT "SkinMarket_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_skinMarketId_fkey" FOREIGN KEY ("skinMarketId") REFERENCES "SkinMarket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_apiSourceId_fkey" FOREIGN KEY ("apiSourceId") REFERENCES "ApiSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSeries" ADD CONSTRAINT "PriceSeries_skinMarketId_fkey" FOREIGN KEY ("skinMarketId") REFERENCES "SkinMarket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSeries" ADD CONSTRAINT "PriceSeries_apiSourceId_fkey" FOREIGN KEY ("apiSourceId") REFERENCES "ApiSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolatilityMetric" ADD CONSTRAINT "VolatilityMetric_skinMarketId_fkey" FOREIGN KEY ("skinMarketId") REFERENCES "SkinMarket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolatilityMetric" ADD CONSTRAINT "VolatilityMetric_apiSourceId_fkey" FOREIGN KEY ("apiSourceId") REFERENCES "ApiSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPreference" ADD CONSTRAINT "SavedPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_skinMarketId_fkey" FOREIGN KEY ("skinMarketId") REFERENCES "SkinMarket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistEntry" ADD CONSTRAINT "WatchlistEntry_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistEntry" ADD CONSTRAINT "WatchlistEntry_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistEntry" ADD CONSTRAINT "WatchlistEntry_skinMarketId_fkey" FOREIGN KEY ("skinMarketId") REFERENCES "SkinMarket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_skinMarketId_fkey" FOREIGN KEY ("skinMarketId") REFERENCES "SkinMarket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;
