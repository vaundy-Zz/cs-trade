import { BuffClient } from '@/clients/buffClient';
import { PinoLogger } from '@/logger';
import { createMockBuffApi } from '@/testing/mocks';

describe('BuffClient', () => {
  let client: BuffClient;
  let logger: PinoLogger;
  let buffMock: ReturnType<typeof createMockBuffApi>;

  beforeEach(() => {
    logger = new PinoLogger({ level: 'silent' });
    client = new BuffClient({ apiKey: 'test-key' }, logger);
    buffMock = createMockBuffApi();
  });

  afterEach(() => {
    buffMock.clean();
  });

  it('should fetch and normalize item data', async () => {
    const itemId = '12345';

    buffMock.mockGetItem(itemId, {
      code: 'OK',
      data: {
        id: itemId,
        name: 'AK-47 | Redline',
        market_hash_name: 'AK-47 | Redline (Field-Tested)',
        price: 12.5,
        currency: 'USD',
        sell_min_price: 12.25,
        sell_num: 50,
        buy_max_price: 11.75,
        buy_num: 30,
        updated_at: new Date().toISOString(),
      },
    });

    const result = await client.getItem(itemId);

    expect(result).toMatchObject({
      id: itemId,
      name: 'AK-47 | Redline (Field-Tested)',
      price: 12.5,
      currency: 'USD',
      quantity: 50,
    });
  });

  it('should fetch and normalize order book data', async () => {
    const itemId = '12345';

    buffMock.mockGetOrderBook(itemId, {
      code: 'OK',
      data: {
        sell_orders: [
          { price: 12.5, amount: 2 },
          { price: 13.0, amount: 1 },
        ],
        buy_orders: [
          { price: 11.5, amount: 3 },
          { price: 11.0, amount: 2 },
        ],
        updated_at: new Date().toISOString(),
      },
    });

    const result = await client.getOrderBook(itemId);

    expect(result.bids[0]).toEqual({ price: 11.5, quantity: 3 });
    expect(result.asks[0]).toEqual({ price: 12.5, quantity: 2 });
    expect(result.spread).toBeCloseTo(1.0);
  });

  it('should throw when API returns non-OK response', async () => {
    const itemId = '12345';

    buffMock.mockGetItem(itemId, {
      code: 'ERROR',
      data: {
        id: itemId,
        name: 'AK-47 | Redline',
        market_hash_name: 'AK-47 | Redline (Field-Tested)',
        price: 12.5,
        currency: 'USD',
        sell_min_price: 12.25,
        sell_num: 50,
        buy_max_price: 11.75,
        buy_num: 30,
        updated_at: new Date().toISOString(),
      },
    });

    await expect(client.getItem(itemId)).rejects.toThrow('BUFF_API_ERROR');
  });
});
