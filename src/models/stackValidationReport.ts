import { ValidationCheckResult } from './validationCheckResult.js';

export interface StackValidationReport {
  project?: string;
  domain?: string;
  protocol: string;
  path: string;
  startedAt: string;
  finishedAt: string;
  checks: ValidationCheckResult[];
  http?: {
    url: string;
    status?: number;
    ok: boolean;
    durationMs: number;
    error?: string;
  };
  gzipAssets?: string[];
}
