import { SteamClient } from '@/clients/steamClient';
import { PinoLogger } from '@/logger';
import { createMockSteamApi } from '@/testing/mocks';

describe('SteamClient', () => {
  let client: SteamClient;
  let logger: PinoLogger;
  let steamMock: ReturnType<typeof createMockSteamApi>;

  beforeEach(() => {
    logger = new PinoLogger({ level: 'silent' });
    client = new SteamClient({ apiKey: 'test-key' }, logger);
    steamMock = createMockSteamApi();
  });

  afterEach(() => {
    steamMock.clean();
  });

  describe('getPriceOverview', () => {
    it('should fetch and normalize price overview successfully', async () => {
      const appId = 730;
      const itemName = 'AK-47 | Redline (Field-Tested)';

      steamMock.mockPriceOverview(appId, itemName, {
        success: true,
        lowest_price: '$10.50',
        median_price: '$11.25',
        volume: '1,234',
      });

      const result = await client.getPriceOverview(appId, itemName);

      expect(result).toMatchObject({
        appId,
        marketHashName: itemName,
        lowestPrice: 10.5,
        medianPrice: 11.25,
        volume: 1234,
        currency: 'USD',
      });
      expect(result.updatedAt).toBeDefined();
    });

    it('should handle API error response', async () => {
      const appId = 730;
      const itemName = 'Invalid Item';

      steamMock.mockPriceOverview(appId, itemName, {
        success: false,
      });

      await expect(client.getPriceOverview(appId, itemName)).rejects.toThrow('STEAM_API_ERROR');
    });

    it('should retry on 5xx errors', async () => {
      const appId = 730;
      const itemName = 'AK-47 | Redline (Field-Tested)';

      steamMock.mockServerError(appId, itemName);
      steamMock.mockServerError(appId, itemName);
      steamMock.mockPriceOverview(appId, itemName, {
        success: true,
        lowest_price: '$10.50',
        median_price: '$11.25',
        volume: '1,234',
      });

      const result = await client.getPriceOverview(appId, itemName);
      expect(result.lowestPrice).toBe(10.5);
    });

    it('should handle rate limit errors', async () => {
      const appId = 730;
      const itemName = 'AK-47 | Redline (Field-Tested)';

      steamMock.mockRateLimitError(appId, itemName);

      await expect(client.getPriceOverview(appId, itemName)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const appId = 730;
      const itemName = 'AK-47 | Redline (Field-Tested)';

      steamMock.mockNetworkError(appId, itemName);

      await expect(client.getPriceOverview(appId, itemName)).rejects.toThrow();
    });
  });
});
