import type { PostDeployCheckResultData } from './postDeployCheckResultData.js';

export interface PostDeployReportData {
  domain: string;
  protocol: string;
  expectedStatus: number;
  startedAt: string;
  finishedAt: string;
  timeoutMs: number;
  results: PostDeployCheckResultData[];
  stats: {
    avgMs: number;
    minMs: number;
    maxMs: number;
    successRate: number;
  };
}
