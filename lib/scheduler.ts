type SchedulerTask = () => Promise<void>;

declare global {
  // eslint-disable-next-line no-var
  var __leaderboardSchedulerHandle?: NodeJS.Timeout | null;
  // eslint-disable-next-line no-var
  var __leaderboardSchedulerStarted?: boolean;
}

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function startScheduler(task: SchedulerTask, intervalMs: number = DEFAULT_INTERVAL_MS): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  if (global.__leaderboardSchedulerStarted) {
    return;
  }

  global.__leaderboardSchedulerStarted = true;
  global.__leaderboardSchedulerHandle = setInterval(() => {
    task().catch((error) => {
      console.error('Scheduler task failed:', error);
    });
  }, intervalMs);
}

export function stopScheduler(): void {
  if (global.__leaderboardSchedulerHandle) {
    clearInterval(global.__leaderboardSchedulerHandle);
    global.__leaderboardSchedulerHandle = null;
  }
  global.__leaderboardSchedulerStarted = false;
}
