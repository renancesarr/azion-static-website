export interface WafPolicyRecord {
  edgeApplicationId: string;
  wafId: string;
  mode: string;
  enabled: boolean;
  updatedAt: string;
  raw: unknown;
}
