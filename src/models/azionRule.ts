export interface AzionRule {
  id: string;
  phase: string;
  order: number;
  behaviors: unknown[];
  criteria: unknown[];
  created_at?: string;
  [key: string]: unknown;
}
