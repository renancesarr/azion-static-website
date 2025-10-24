import { PostDeployCheckResult } from './postDeployCheckResult.js';

export interface PostDeployReport {
  domain: string;
  protocol: string;
  expectedStatus: number;
  startedAt: string;
  finishedAt: string;
  timeoutMs: number;
  results: PostDeployCheckResult[];
  stats: {
    avgMs: number;
    minMs: number;
    maxMs: number;
    successRate: number;
  };
}
