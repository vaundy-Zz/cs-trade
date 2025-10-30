import { query } from '../database/db.js';

export function calculateMovingAverage(data, period) {
  if (!data || data.length < period) {
    return [];
  }

  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, val) => acc + parseFloat(val.price || val.avg_price || 0), 0);
    const avg = sum / period;
    result.push({
      timestamp: data[i].timestamp || data[i].date || data[i].hour,
      value: parseFloat(avg.toFixed(2))
    });
  }
  return result;
}

export function calculateEMA(data, period) {
  if (!data || data.length < period) {
    return [];
  }

  const result = [];
  const multiplier = 2 / (period + 1);
  
  let ema = data.slice(0, period).reduce((acc, val) => 
    acc + parseFloat(val.price || val.avg_price || 0), 0) / period;
  
  result.push({
    timestamp: data[period - 1].timestamp || data[period - 1].date || data[period - 1].hour,
    value: parseFloat(ema.toFixed(2))
  });

  for (let i = period; i < data.length; i++) {
    const price = parseFloat(data[i].price || data[i].avg_price || 0);
    ema = (price - ema) * multiplier + ema;
    result.push({
      timestamp: data[i].timestamp || data[i].date || data[i].hour,
      value: parseFloat(ema.toFixed(2))
    });
  }

  return result;
}

export function calculateVolatility(data) {
  if (!data || data.length === 0) {
    return 0;
  }

  const prices = data.map(d => parseFloat(d.price || d.avg_price || 0));
  const mean = prices.reduce((acc, val) => acc + val, 0) / prices.length;
  const variance = prices.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / prices.length;
  return Math.sqrt(variance);
}

export async function getPriceData(skinIds, marketNames, startDate, endDate, granularity = 'daily') {
  const table = granularity === 'hourly' ? 'hourly_price_aggregates' : 'daily_price_aggregates';
  const timeColumn = granularity === 'hourly' ? 'hour' : 'date';

  const skinFilter = skinIds && skinIds.length > 0
    ? `AND skin_id = ANY($3::text[])`
    : '';

  const marketFilter = marketNames && marketNames.length > 0
    ? `AND market_name = ANY($4::text[])`
    : '';

  const params = [startDate, endDate];
  if (skinIds && skinIds.length > 0) params.push(skinIds);
  if (marketNames && marketNames.length > 0) params.push(marketNames);

  const result = await query(`
    SELECT 
      skin_id,
      skin_name,
      market_name,
      ${timeColumn} as timestamp,
      low,
      high,
      avg_price,
      open,
      close,
      total_volume
    FROM ${table}
    WHERE ${timeColumn} >= $1 AND ${timeColumn} <= $2
    ${skinFilter}
    ${marketFilter}
    ORDER BY ${timeColumn} ASC
  `, params);

  return result.rows;
}

export async function getVolatilityData(skinIds, marketNames, startDate, endDate) {
  const skinFilter = skinIds && skinIds.length > 0
    ? `AND skin_id = ANY($3::text[])`
    : '';

  const marketFilter = marketNames && marketNames.length > 0
    ? `AND market_name = ANY($4::text[])`
    : '';

  const params = [startDate, endDate];
  if (skinIds && skinIds.length > 0) params.push(skinIds);
  if (marketNames && marketNames.length > 0) params.push(marketNames);

  const result = await query(`
    SELECT 
      skin_id,
      skin_name,
      market_name,
      date,
      price_stddev,
      coefficient_of_variation,
      daily_range,
      range_percentage
    FROM volatility_metrics
    WHERE date >= $1 AND date <= $2
    ${skinFilter}
    ${marketFilter}
    ORDER BY date ASC
  `, params);

  return result.rows;
}

export async function getAvailableSkins() {
  const result = await query(`
    SELECT DISTINCT skin_id, skin_name
    FROM market_data
    ORDER BY skin_name
  `);
  return result.rows;
}

export async function getAvailableMarkets() {
  const result = await query(`
    SELECT DISTINCT market_name
    FROM market_data
    ORDER BY market_name
  `);
  return result.rows;
}

export function groupBySkinAndMarket(data) {
  const grouped = {};
  
  for (const row of data) {
    const key = `${row.skin_id}_${row.market_name}`;
    if (!grouped[key]) {
      grouped[key] = {
        skin_id: row.skin_id,
        skin_name: row.skin_name,
        market_name: row.market_name,
        data: []
      };
    }
    grouped[key].data.push(row);
  }
  
  return Object.values(grouped);
}

export async function refreshMaterializedViews() {
  await query('SELECT refresh_analytics_views()');
}
