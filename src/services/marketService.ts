import { SteamClient } from '@/clients/steamClient';
import { BuffClient } from '@/clients/buffClient';
import { UnifiedMarketQuote, MarketServiceOptions } from '@/clients/types';
import { Logger } from '@/logger';
import { RateLimiter } from '@/rateLimit/types';
import { withRateLimit } from '@/rateLimit/helpers';
import { QuotaTracker, QuotaConfig } from '@/rateLimit/quotaTracker';

export interface MarketServiceConfig {
  steamClient: SteamClient;
  buffClient: BuffClient;
  logger: Logger;
  rateLimiters?: {
    steam?: RateLimiter;
    buff?: RateLimiter;
  };
  quotaTracker?: QuotaTracker;
  quotaConfig?: {
    steam?: QuotaConfig;
    buff?: QuotaConfig;
  };
}

export class MarketService {
  private readonly steamClient: SteamClient;
  private readonly buffClient: BuffClient;
  private readonly logger: Logger;
  private readonly rateLimiters?: MarketServiceConfig['rateLimiters'];
  private readonly quotaTracker?: QuotaTracker;
  private readonly quotaConfig?: MarketServiceConfig['quotaConfig'];

  constructor(config: MarketServiceConfig) {
    this.steamClient = config.steamClient;
    this.buffClient = config.buffClient;
    this.logger = config.logger;
    this.rateLimiters = config.rateLimiters;
    this.quotaTracker = config.quotaTracker;
    this.quotaConfig = config.quotaConfig;
  }

  async getSteamQuote(
    appId: number,
    itemName: string,
    options?: MarketServiceOptions,
  ): Promise<UnifiedMarketQuote> {
    if (this.quotaTracker && this.quotaConfig?.steam) {
      await this.quotaTracker.trackUsage('steam', this.quotaConfig.steam);
    }

    const handler = async () => {
      const item = await this.steamClient.getPriceOverview(
        appId,
        itemName,
        this.getCurrencyId(options?.currency),
      );

      return {
        source: 'steam' as const,
        itemName: item.marketHashName,
        buyPrice: item.medianPrice,
        sellPrice: item.lowestPrice,
        currency: item.currency,
        volume: item.volume,
        timestamp: item.updatedAt,
      };
    };

    if (this.rateLimiters?.steam) {
      return withRateLimit(this.rateLimiters.steam, handler, {
        identifier: () => `steam:${appId}:${itemName}`,
      })();
    }

    return handler();
  }

  async getBuffQuote(itemId: string, options?: MarketServiceOptions): Promise<UnifiedMarketQuote> {
    if (this.quotaTracker && this.quotaConfig?.buff) {
      await this.quotaTracker.trackUsage('buff', this.quotaConfig.buff);
    }

    const handler = async () => {
      const [item, orderBook] = await Promise.all([
        this.buffClient.getItem(itemId),
        this.buffClient.getOrderBook(itemId),
      ]);

      const buyPrice = orderBook.bids[0]?.price ?? 0;
      const sellPrice = orderBook.asks[0]?.price ?? item.price;

      return {
        source: 'buff' as const,
        itemName: item.name,
        buyPrice,
        sellPrice,
        currency: item.currency,
        volume: item.quantity,
        timestamp: item.updatedAt,
      };
    };

    if (this.rateLimiters?.buff) {
      return withRateLimit(this.rateLimiters.buff, handler, {
        identifier: () => `buff:${itemId}`,
      })();
    }

    return handler();
  }

  async getAllQuotes(
    appId: number,
    itemName: string,
    buffItemId: string,
    options?: MarketServiceOptions,
  ): Promise<UnifiedMarketQuote[]> {
    this.logger.info('Fetching quotes from all sources', { appId, itemName, buffItemId });

    const [steamQuote, buffQuote] = await Promise.allSettled([
      this.getSteamQuote(appId, itemName, options),
      this.getBuffQuote(buffItemId, options),
    ]);

    const quotes: UnifiedMarketQuote[] = [];

    if (steamQuote.status === 'fulfilled') {
      quotes.push(steamQuote.value);
    } else {
      this.logger.warn('Failed to fetch Steam quote', { error: steamQuote.reason });
    }

    if (buffQuote.status === 'fulfilled') {
      quotes.push(buffQuote.value);
    } else {
      this.logger.warn('Failed to fetch Buff quote', { error: buffQuote.reason });
    }

    return quotes;
  }

  private getCurrencyId(currency?: string): number {
    const currencyMap: Record<string, number> = {
      USD: 1,
      GBP: 2,
      EUR: 3,
      CHF: 4,
      RUB: 5,
      PLN: 6,
      BRL: 7,
      JPY: 8,
      NOK: 9,
      IDR: 10,
    };
    return currencyMap[currency?.toUpperCase() ?? 'USD'] ?? 1;
  }
}
