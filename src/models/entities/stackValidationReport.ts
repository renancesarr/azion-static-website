import type { StackValidationReportData, StackValidationHttpData } from '../shared/stackValidationReportData.js';
import { ValidationCheckResult } from './validationCheckResult.js';

function cloneChecks(checks: ValidationCheckResult[]): ValidationCheckResult[] {
  return checks.map((check) => ValidationCheckResult.hydrate(check.toJSON()));
}

function cloneGzipAssets(assets?: string[]): string[] | undefined {
  if (!assets) {
    return undefined;
  }
  return [...assets];
}

function cloneHttp(http?: StackValidationHttpData): StackValidationHttpData | undefined {
  if (!http) {
    return undefined;
  }
  return {
    url: http.url,
    status: http.status,
    ok: http.ok,
    durationMs: http.durationMs,
    error: http.error,
  };
}

export class StackValidationReport implements StackValidationReportData {
  readonly project?: string;
  readonly domain?: string;
  readonly protocol: string;
  readonly path: string;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly checks: ValidationCheckResult[];
  readonly http?: StackValidationHttpData;
  readonly gzipAssets?: string[];

  private constructor(data: {
    project?: string;
    domain?: string;
    protocol: string;
    path: string;
    startedAt: string;
    finishedAt: string;
    checks: ValidationCheckResult[];
    http?: StackValidationHttpData;
    gzipAssets?: string[];
  }) {
    this.project = data.project;
    this.domain = data.domain;
    this.protocol = data.protocol;
    this.path = data.path;
    this.startedAt = data.startedAt;
    this.finishedAt = data.finishedAt;
    this.checks = cloneChecks(data.checks);
    this.http = cloneHttp(data.http);
    this.gzipAssets = cloneGzipAssets(data.gzipAssets);
  }

  static create(data: StackValidationReportData): StackValidationReport {
    const checks = data.checks.map((check) => ValidationCheckResult.hydrate(check));
    return new StackValidationReport({
      ...data,
      checks,
    });
  }

  static hydrate(data: StackValidationReportData): StackValidationReport {
    return StackValidationReport.create(data);
  }

  toJSON(): StackValidationReportData {
    return {
      project: this.project,
      domain: this.domain,
      protocol: this.protocol,
      path: this.path,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      checks: this.checks.map((check) => check.toJSON()),
      http: cloneHttp(this.http),
      gzipAssets: cloneGzipAssets(this.gzipAssets),
    };
  }
}
