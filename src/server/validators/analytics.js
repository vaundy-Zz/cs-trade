import { z } from 'zod';
import {
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
} from 'date-fns';

const RANGE_MAP = {
  '7d': (end) => subDays(end, 7),
  '30d': (end) => subDays(end, 30),
  '90d': (end) => subDays(end, 90),
  '180d': (end) => subDays(end, 180),
  '1y': (end) => subMonths(end, 12),
};

const querySchema = z.object({
  skins: z.string().optional(),
  markets: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  range: z.enum(['7d', '30d', '90d', '180d', '1y']).optional(),
  granularity: z.enum(['daily', 'hourly']).optional(),
  ma: z.string().optional(),
});

function parseDate(value, fallback, transformer) {
  if (!value) return transformer(fallback);

  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return null;
  }

  return transformer(parsed);
}

export function validateAnalyticsQuery(rawQuery) {
  const parseResult = querySchema.safeParse(rawQuery);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.errors[0]?.message || 'Invalid query parameters' };
  }

  const { skins, markets, start, end, range, granularity = 'daily', ma } = parseResult.data;

  const endDateRaw = parseDate(end, new Date(), endOfDay);
  if (!endDateRaw) {
    return { success: false, error: 'Invalid end date supplied' };
  }

  let startDateRaw = parseDate(start, endDateRaw, startOfDay);

  if (!start && range) {
    const rangeFn = RANGE_MAP[range];
    if (rangeFn) {
      startDateRaw = startOfDay(rangeFn(endDateRaw));
    }
  }

  if (!startDateRaw) {
    return { success: false, error: 'Invalid start date supplied' };
  }

  if (startDateRaw > endDateRaw) {
    return { success: false, error: 'Start date must be before end date' };
  }

  const skinIds = skins ? skins.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const marketNames = markets ? markets.split(',').map((m) => m.trim()).filter(Boolean) : [];

  let maPeriods = [7, 30];
  if (ma) {
    maPeriods = ma.split(',')
      .map((v) => parseInt(v, 10))
      .filter((num) => Number.isInteger(num) && num > 1 && num <= 365);

    if (maPeriods.length === 0) {
      maPeriods = [7, 30];
    }
  }

  return {
    success: true,
    data: {
      skinIds,
      marketNames,
      startDate: startDateRaw,
      endDate: endDateRaw,
      granularity,
      maPeriods,
    },
  };
}
