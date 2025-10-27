import { PostDeployCheckResult } from '../../models/entities/postDeployCheckResult.js';

export function calculateStats(results: PostDeployCheckResult[]) {
  const durations = results.map((r) => r.durationMs);
  const avgMs = durations.length ? durations.reduce((acc, cur) => acc + cur, 0) / durations.length : 0;
  const minMs = durations.length ? Math.min(...durations) : 0;
  const maxMs = durations.length ? Math.max(...durations) : 0;
  const successRate = results.length ? results.filter((r) => r.ok).length / results.length : 0;

  return {
    avgMs,
    minMs,
    maxMs,
    successRate,
  } as const;
}
