import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { query, closePool } from '../database/db.js';

describe('Analytics API', () => {
  beforeAll(async () => {
    await query('DELETE FROM market_data');

    await query(`
      INSERT INTO market_data (skin_id, skin_name, market_name, price, volume, timestamp)
      VALUES
        ('test-001', 'Test Skin 1', 'Test Market', 100.00, 50, NOW() - INTERVAL '2 days'),
        ('test-001', 'Test Skin 1', 'Test Market', 105.00, 60, NOW() - INTERVAL '1 day'),
        ('test-001', 'Test Skin 1', 'Test Market', 110.00, 70, NOW()),
        ('test-002', 'Test Skin 2', 'Test Market', 200.00, 40, NOW() - INTERVAL '2 days'),
        ('test-002', 'Test Skin 2', 'Test Market', 210.00, 45, NOW() - INTERVAL '1 day'),
        ('test-002', 'Test Skin 2', 'Test Market', 220.00, 50, NOW())
    `);

    await query('SELECT refresh_analytics_views()');
  });

  afterAll(async () => {
    await closePool();
  });

  describe('GET /api/analytics/skins', () => {
    it('should return available skins', async () => {
      const response = await request(app)
        .get('/api/analytics/skins')
        .expect(200);

      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          skin_id: expect.any(String),
          skin_name: expect.any(String)
        })
      ]));
    });
  });

  describe('GET /api/analytics/markets', () => {
    it('should return available markets', async () => {
      const response = await request(app)
        .get('/api/analytics/markets')
        .expect(200);

      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          market_name: expect.any(String)
        })
      ]));
    });
  });

  describe('GET /api/analytics/price-data', () => {
    it('should return price data with valid query params', async () => {
      const response = await request(app)
        .get('/api/analytics/price-data')
        .query({
          range: '7d',
          granularity: 'daily'
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('skin_id');
        expect(response.body[0]).toHaveProperty('skin_name');
        expect(response.body[0]).toHaveProperty('market_name');
        expect(response.body[0]).toHaveProperty('data');
        expect(response.body[0]).toHaveProperty('movingAverages');
      }
    });

    it('should filter by skin IDs', async () => {
      const response = await request(app)
        .get('/api/analytics/price-data')
        .query({
          skins: 'test-001',
          range: '7d',
          granularity: 'daily'
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body.every(s => s.skin_id === 'test-001')).toBe(true);
      }
    });

    it('should calculate moving averages', async () => {
      const response = await request(app)
        .get('/api/analytics/price-data')
        .query({
          range: '7d',
          granularity: 'daily',
          ma: '2'
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].movingAverages).toBeDefined();
        expect(response.body[0].movingAverages).toHaveProperty('ma2');
        expect(response.body[0].movingAverages).toHaveProperty('ema2');
      }
    });

    it('should return 400 for invalid date range', async () => {
      const response = await request(app)
        .get('/api/analytics/price-data')
        .query({
          start: '2023-12-31',
          end: '2023-01-01'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/analytics/volatility', () => {
    it('should return volatility data', async () => {
      const response = await request(app)
        .get('/api/analytics/volatility')
        .query({
          range: '7d'
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('skin_id');
        expect(response.body[0]).toHaveProperty('data');
      }
    });
  });

  describe('GET /api/analytics/export/csv', () => {
    it('should export data as CSV', async () => {
      const response = await request(app)
        .get('/api/analytics/export/csv')
        .query({
          range: '7d',
          granularity: 'daily'
        })
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/csv/);
      expect(response.headers['content-disposition']).toMatch(/attachment/);
      expect(response.text).toContain('skin_id');
      expect(response.text).toContain('skin_name');
    });
  });

  describe('POST /api/analytics/export/png', () => {
    it('should export chart as PNG', async () => {
      const chartConfig = {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Test Data',
            data: [10, 20, 30]
          }]
        },
        options: {
          responsive: false
        }
      };

      const response = await request(app)
        .post('/api/analytics/export/png')
        .send({ chartConfig })
        .expect(200);

      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['content-disposition']).toMatch(/attachment/);
      expect(response.body).toBeInstanceOf(Buffer);
    });

    it('should return 400 without chart config', async () => {
      await request(app)
        .post('/api/analytics/export/png')
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/analytics/refresh-views', () => {
    it('should refresh materialized views', async () => {
      const response = await request(app)
        .post('/api/analytics/refresh-views')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('refreshed');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
