export interface PostDeployCheckResult {
  path: string;
  status?: number;
  ok: boolean;
  durationMs: number;
  error?: string;
  issues?: string[];
}
