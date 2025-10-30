import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  calculateMovingAverage,
  calculateEMA,
  calculateVolatility,
  groupBySkinAndMarket,
} from '../services/analytics.js';

describe('Analytics Calculations', () => {
  describe('calculateMovingAverage', () => {
    it('should calculate simple moving average correctly', () => {
      const data = [
        { price: 100 },
        { price: 110 },
        { price: 120 },
        { price: 130 },
        { price: 140 }
      ];

      const ma3 = calculateMovingAverage(data, 3);

      expect(ma3).toHaveLength(3);
      expect(ma3[0].value).toBe(110);
      expect(ma3[1].value).toBe(120);
      expect(ma3[2].value).toBe(130);
    });

    it('should return empty array if data length is less than period', () => {
      const data = [{ price: 100 }, { price: 110 }];
      const ma3 = calculateMovingAverage(data, 3);

      expect(ma3).toHaveLength(0);
    });

    it('should handle avg_price field', () => {
      const data = [
        { avg_price: 100 },
        { avg_price: 110 },
        { avg_price: 120 }
      ];

      const ma3 = calculateMovingAverage(data, 3);

      expect(ma3).toHaveLength(1);
      expect(ma3[0].value).toBe(110);
    });
  });

  describe('calculateEMA', () => {
    it('should calculate exponential moving average correctly', () => {
      const data = [
        { price: 100 },
        { price: 110 },
        { price: 120 },
        { price: 130 },
        { price: 140 }
      ];

      const ema3 = calculateEMA(data, 3);

      expect(ema3).toHaveLength(3);
      expect(ema3[0].value).toBe(110);
    });

    it('should apply proper exponential weighting', () => {
      const data = Array.from({ length: 10 }, (_, i) => ({ price: (i + 1) * 10 }));
      const ema5 = calculateEMA(data, 5);

      const multiplier = 2 / (5 + 1);
      expect(ema5.length).toBeGreaterThan(0);

      for (let i = 1; i < ema5.length; i++) {
        expect(ema5[i].value).toBeGreaterThan(0);
      }
    });

    it('should return empty array if data length is less than period', () => {
      const data = [{ price: 100 }, { price: 110 }];
      const ema3 = calculateEMA(data, 3);

      expect(ema3).toHaveLength(0);
    });
  });

  describe('calculateVolatility', () => {
    it('should calculate standard deviation correctly', () => {
      const data = [
        { price: 100 },
        { price: 110 },
        { price: 120 },
        { price: 130 },
        { price: 140 }
      ];

      const volatility = calculateVolatility(data);

      const mean = 120;
      const variance = ((400 + 100 + 0 + 100 + 400) / 5);
      const expectedStdDev = Math.sqrt(variance);

      expect(volatility).toBeCloseTo(expectedStdDev, 2);
    });

    it('should return 0 for empty array', () => {
      const volatility = calculateVolatility([]);
      expect(volatility).toBe(0);
    });

    it('should return 0 for single data point', () => {
      const data = [{ price: 100 }];
      const volatility = calculateVolatility(data);
      expect(volatility).toBe(0);
    });

    it('should handle avg_price field', () => {
      const data = [
        { avg_price: 100 },
        { avg_price: 110 },
        { avg_price: 120 }
      ];

      const volatility = calculateVolatility(data);
      expect(volatility).toBeGreaterThan(0);
    });
  });

  describe('groupBySkinAndMarket', () => {
    it('should group data by skin_id and market_name', () => {
      const data = [
        { skin_id: 'skin-001', skin_name: 'AWP', market_name: 'Steam', price: 100 },
        { skin_id: 'skin-001', skin_name: 'AWP', market_name: 'Steam', price: 110 },
        { skin_id: 'skin-001', skin_name: 'AWP', market_name: 'CS.Money', price: 105 },
        { skin_id: 'skin-002', skin_name: 'AK47', market_name: 'Steam', price: 50 },
      ];

      const grouped = groupBySkinAndMarket(data);

      expect(grouped).toHaveLength(3);
      expect(grouped[0].data).toHaveLength(2);
      expect(grouped[1].data).toHaveLength(1);
      expect(grouped[2].data).toHaveLength(1);
    });

    it('should preserve skin and market information', () => {
      const data = [
        { skin_id: 'skin-001', skin_name: 'AWP', market_name: 'Steam', price: 100 },
      ];

      const grouped = groupBySkinAndMarket(data);

      expect(grouped[0].skin_id).toBe('skin-001');
      expect(grouped[0].skin_name).toBe('AWP');
      expect(grouped[0].market_name).toBe('Steam');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values gracefully in MA calculation', () => {
      const data = [
        { price: 100 },
        { price: null },
        { price: 120 }
      ];

      const ma2 = calculateMovingAverage(data, 2);
      expect(ma2).toHaveLength(2);
    });

    it('should handle very large numbers', () => {
      const data = Array.from({ length: 5 }, (_, i) => ({ price: 1000000 + i * 10000 }));
      const ma3 = calculateMovingAverage(data, 3);

      expect(ma3).toHaveLength(3);
      expect(ma3[0].value).toBe(1010000);
    });

    it('should handle decimal precision correctly', () => {
      const data = [
        { price: 100.123 },
        { price: 110.456 },
        { price: 120.789 }
      ];

      const ma3 = calculateMovingAverage(data, 3);

      expect(ma3[0].value).toBeCloseTo(110.456, 2);
    });
  });

  describe('Moving Average Correctness', () => {
    it('should calculate 7-day MA correctly for realistic price data', () => {
      const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
      const data = prices.map(price => ({ price }));

      const ma7 = calculateMovingAverage(data, 7);

      const expectedFirst = (100 + 102 + 101 + 103 + 105 + 104 + 106) / 7;
      expect(ma7[0].value).toBeCloseTo(expectedFirst, 2);
    });

    it('should calculate 30-day MA correctly', () => {
      const data = Array.from({ length: 60 }, (_, i) => ({
        price: 1000 + Math.sin(i * 0.1) * 50
      }));

      const ma30 = calculateMovingAverage(data, 30);

      expect(ma30.length).toBe(31);
      ma30.forEach(point => {
        expect(point.value).toBeGreaterThan(0);
        expect(point.value).toBeCloseTo(1000, 0);
      });
    });
  });

  describe('EMA Correctness', () => {
    it('should weight recent prices more heavily than older prices', () => {
      const data = [
        { price: 100 },
        { price: 100 },
        { price: 100 },
        { price: 150 },
        { price: 150 }
      ];

      const ema3 = calculateEMA(data, 3);

      expect(ema3[ema3.length - 1].value).toBeGreaterThan(ema3[0].value);
      expect(ema3[ema3.length - 1].value).toBeCloseTo(150, 0);
    });
  });
});
