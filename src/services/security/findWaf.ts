import { readStateFile } from '../../utils/state.js';
import { WafState } from '../../models/wafState.js';
import { WafPolicyRecord } from '../../models/wafPolicyRecord.js';
import { WAF_STATE_FILE } from './constants.js';
import { normalizeWafState } from './normalizeWafState.js';

export async function findWaf(edgeApplicationId: string): Promise<WafPolicyRecord | undefined> {
  const current = normalizeWafState(await readStateFile<WafState>(WAF_STATE_FILE));
  return current.policies[edgeApplicationId];
}
