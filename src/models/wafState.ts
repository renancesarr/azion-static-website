import { WafPolicyRecord } from './wafPolicyRecord.js';

export interface WafState {
  policies: Record<string, WafPolicyRecord>;
}
