import type { PostDeployReportData } from '../shared/postDeployReportData.js';
import { PostDeployCheckResult } from './postDeployCheckResult.js';

function cloneStats(stats: PostDeployReportData['stats']): PostDeployReportData['stats'] {
  return {
    avgMs: stats.avgMs,
    minMs: stats.minMs,
    maxMs: stats.maxMs,
    successRate: stats.successRate,
  };
}

export class PostDeployReport implements PostDeployReportData {
  readonly domain: string;
  readonly protocol: string;
  readonly expectedStatus: number;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly timeoutMs: number;
  readonly results: PostDeployCheckResult[];
  readonly stats: PostDeployReportData['stats'];

  private constructor(data: {
    domain: string;
    protocol: string;
    expectedStatus: number;
    startedAt: string;
    finishedAt: string;
    timeoutMs: number;
    results: PostDeployCheckResult[];
    stats: PostDeployReportData['stats'];
  }) {
    this.domain = data.domain;
    this.protocol = data.protocol;
    this.expectedStatus = data.expectedStatus;
    this.startedAt = data.startedAt;
    this.finishedAt = data.finishedAt;
    this.timeoutMs = data.timeoutMs;
    this.results = data.results.map((result) => PostDeployCheckResult.hydrate(result.toJSON()));
    this.stats = cloneStats(data.stats);
  }

  static create(data: PostDeployReportData): PostDeployReport {
    return new PostDeployReport({
      domain: data.domain,
      protocol: data.protocol,
      expectedStatus: data.expectedStatus,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt,
      timeoutMs: data.timeoutMs,
      results: data.results.map((result) => PostDeployCheckResult.hydrate(result)),
      stats: cloneStats(data.stats),
    });
  }

  static hydrate(data: PostDeployReportData): PostDeployReport {
    return PostDeployReport.create(data);
  }

  toJSON(): PostDeployReportData {
    return {
      domain: this.domain,
      protocol: this.protocol,
      expectedStatus: this.expectedStatus,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      timeoutMs: this.timeoutMs,
      results: this.results.map((result) => result.toJSON()),
      stats: cloneStats(this.stats),
    };
  }
}
