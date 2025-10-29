import { LeaderboardEntry, Category } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';
import clsx from 'clsx';

interface Props {
  entries: LeaderboardEntry[];
  category: Category;
}

export default function LeaderboardList({ entries, category }: Props) {
  const config = CATEGORY_CONFIG[category];

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400">
        No entries found for this leaderboard.
      </div>
    );
  }

  const formatMetricValue = (value: number): string => {
    switch (category) {
      case 'price_growth':
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
      case 'trading_volume':
        return `${Math.round(value).toLocaleString()}`;
      case 'demand':
        return `${Math.round(value).toLocaleString()}`;
      case 'rarity':
        return `Rank ${Math.round(value)}`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.skin.id}
          className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700 hover:bg-slate-900 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold',
                entry.rank === 1 && 'bg-yellow-500/20 text-yellow-400',
                entry.rank === 2 && 'bg-slate-400/20 text-slate-200',
                entry.rank === 3 && 'bg-amber-700/20 text-amber-400',
                entry.rank > 3 && 'bg-slate-800 text-slate-300'
              )}
            >
              {entry.rank}
            </div>

            {entry.skin.imageUrl && (
              <img
                src={entry.skin.imageUrl}
                alt={entry.skin.name}
                className="h-14 w-24 rounded-lg border border-slate-800 object-cover"
              />
            )}

            <div>
              <h3 className="text-base font-semibold text-white">{entry.skin.name}</h3>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {entry.skin.rarityTier}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xl font-semibold text-white">{formatMetricValue(entry.metricValue)}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">{config.metricLabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
