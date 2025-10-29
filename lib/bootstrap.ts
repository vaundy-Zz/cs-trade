import { initializeDatabase } from './db';
import { recomputeLeaderboardRankings } from './precompute';
import { seedDatabaseIfNeeded } from './seed';
import { startScheduler } from './scheduler';

let bootstrapPromise: Promise<void> | null = null;

export async function ensureAppInitialized(): Promise<void> {
  if (bootstrapPromise) {
    await bootstrapPromise;
    return;
  }

  bootstrapPromise = (async () => {
    await initializeDatabase();
    await seedDatabaseIfNeeded();
    await recomputeLeaderboardRankings();
    startScheduler(recomputeLeaderboardRankings);
  })();

  await bootstrapPromise;
}
