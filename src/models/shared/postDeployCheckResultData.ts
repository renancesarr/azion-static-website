export interface PostDeployCheckResultData {
  path: string;
  status?: number;
  ok: boolean;
  durationMs: number;
  error?: string;
  issues?: string[];
}
