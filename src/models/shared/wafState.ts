import type { WafPolicyRecordData } from './wafPolicyRecordData.js';

export interface WafState {
  policies: Record<string, WafPolicyRecordData>;
}
