import type { PostDeployCheckResultData } from '../shared/postDeployCheckResultData.js';

export class PostDeployCheckResult implements PostDeployCheckResultData {
  readonly path: string;
  readonly status?: number;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly error?: string;
  readonly issues?: string[];

  private constructor(data: PostDeployCheckResultData) {
    this.path = data.path;
    this.status = data.status;
    this.ok = data.ok;
    this.durationMs = data.durationMs;
    this.error = data.error;
    this.issues = data.issues ? [...data.issues] : undefined;
  }

  static create(data: PostDeployCheckResultData): PostDeployCheckResult {
    return new PostDeployCheckResult({
      ...data,
      issues: data.issues ? [...data.issues] : undefined,
    });
  }

  static hydrate(data: PostDeployCheckResultData): PostDeployCheckResult {
    return PostDeployCheckResult.create(data);
  }

  toJSON(): PostDeployCheckResultData {
    return {
      path: this.path,
      status: this.status,
      ok: this.ok,
      durationMs: this.durationMs,
      error: this.error,
      issues: this.issues ? [...this.issues] : undefined,
    };
  }
}
