import express from 'express';
import { stringify } from 'csv-stringify/sync';
import {
  getPriceData,
  getVolatilityData,
  getAvailableSkins,
  getAvailableMarkets,
  calculateMovingAverage,
  calculateEMA,
  groupBySkinAndMarket,
} from '../services/analytics.js';
import { validateAnalyticsQuery } from '../validators/analytics.js';
import { refreshMaterializedViews } from '../services/analytics.js';
import { generateSimpleChartPNG } from '../utils/pngChart.js';

const router = express.Router();

router.get('/skins', async (req, res) => {
  const skins = await getAvailableSkins();
  res.json(skins);
});

router.get('/markets', async (req, res) => {
  const markets = await getAvailableMarkets();
  res.json(markets);
});

router.get('/price-data', async (req, res) => {
  const validation = validateAnalyticsQuery(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const { skinIds, marketNames, startDate, endDate, granularity, maPeriods } = validation.data;

  const data = await getPriceData(skinIds, marketNames, startDate, endDate, granularity);
  const grouped = groupBySkinAndMarket(data);

  const result = grouped.map(series => {
    const movingAverages = {};
    if (maPeriods && maPeriods.length > 0) {
      for (const period of maPeriods) {
        movingAverages[`ma${period}`] = calculateMovingAverage(series.data, period);
        movingAverages[`ema${period}`] = calculateEMA(series.data, period);
      }
    }

    return {
      ...series,
      movingAverages
    };
  });

  res.json(result);
});

router.get('/volatility', async (req, res) => {
  const validation = validateAnalyticsQuery(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const { skinIds, marketNames, startDate, endDate } = validation.data;
  const data = await getVolatilityData(skinIds, marketNames, startDate, endDate);
  const grouped = groupBySkinAndMarket(data);

  res.json(grouped);
});

router.get('/export/csv', async (req, res) => {
  const validation = validateAnalyticsQuery(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const { skinIds, marketNames, startDate, endDate, granularity } = validation.data;
  const data = await getPriceData(skinIds, marketNames, startDate, endDate, granularity);

  const csvData = data.map(row => ({
    skin_id: row.skin_id,
    skin_name: row.skin_name,
    market_name: row.market_name,
    timestamp: row.timestamp,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    avg_price: row.avg_price,
    total_volume: row.total_volume
  }));

  const csv = stringify(csvData, {
    header: true,
    columns: ['skin_id', 'skin_name', 'market_name', 'timestamp', 'open', 'high', 'low', 'close', 'avg_price', 'total_volume']
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.csv`);
  res.send(csv);
});

router.post('/export/png', async (req, res) => {
  try {
    const { chartConfig } = req.body;
    
    if (!chartConfig) {
      return res.status(400).json({ error: 'Chart configuration is required' });
    }

    const buffer = generateSimpleChartPNG(chartConfig);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename=chart-${Date.now()}.png`);
    res.send(buffer);
  } catch (error) {
    console.error('PNG export error:', error);
    res.status(500).json({ error: 'Failed to generate chart image' });
  }
});

router.post('/refresh-views', async (req, res) => {
  await refreshMaterializedViews();
  res.json({ message: 'Materialized views refreshed successfully' });
});

export default router;
