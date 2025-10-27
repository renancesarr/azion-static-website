import type { WafState } from '../../models/shared/wafState.js';
import { WafPolicyRecord } from '../../models/entities/wafPolicyRecord.js';
import { WAF_STATE_FILE } from './constants.js';
import { normalizeWafState } from './normalizeWafState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function findWaf(
  state: StateRepository,
  edgeApplicationId: string,
): Promise<WafPolicyRecord | undefined> {
  const current = normalizeWafState(await state.read<WafState>(WAF_STATE_FILE));
  const record = current.policies[edgeApplicationId];
  if (!record) {
    return undefined;
  }
  return WafPolicyRecord.hydrate(record);
}
