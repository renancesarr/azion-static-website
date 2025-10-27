import type { ValidationCheckResultData } from './validationCheckResultData.js';

export interface StackValidationHttpData {
  url: string;
  status?: number;
  ok: boolean;
  durationMs: number;
  error?: string;
}

export interface StackValidationReportData {
  project?: string;
  domain?: string;
  protocol: string;
  path: string;
  startedAt: string;
  finishedAt: string;
  checks: ValidationCheckResultData[];
  http?: StackValidationHttpData;
  gzipAssets?: string[];
}
