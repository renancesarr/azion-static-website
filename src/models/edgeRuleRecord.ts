export interface EdgeRuleRecord {
  id: string;
  edgeApplicationId: string;
  phase: string;
  order: number;
  createdAt: string;
  raw: unknown;
}
