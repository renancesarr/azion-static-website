export type Task<T> = () => Promise<T>;

export interface PoolOptions {
  concurrency: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface PoolResult<T> {
  value?: T;
  error?: Error;
  attempts: number;
}

export async function runWithPool<T>(tasks: Task<T>[], options: PoolOptions): Promise<PoolResult<T>[]> {
  const { concurrency, maxRetries = 0, retryDelayMs = 250 } = options;
  const results: PoolResult<T>[] = Array.from({ length: tasks.length }, () => ({ attempts: 0 }));
  let currentIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = currentIndex++;
      if (index >= tasks.length) {
        return;
      }

      const task = tasks[index];
      let attempts = 0;
      while (true) {
        attempts += 1;
        try {
          const value = await task();
          results[index] = { value, attempts };
          break;
        } catch (error) {
          if (attempts > maxRetries) {
            results[index] = { error: error as Error, attempts };
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
