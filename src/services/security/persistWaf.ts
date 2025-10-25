import { WafPolicyRecord } from '../../models/wafPolicyRecord.js';
import { WafState } from '../../models/wafState.js';
import { WAF_STATE_FILE } from './constants.js';
import { normalizeWafState } from './normalizeWafState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistWaf(state: StateRepository, record: WafPolicyRecord): Promise<WafPolicyRecord> {
  const current = normalizeWafState(await state.read<WafState>(WAF_STATE_FILE));
  current.policies[record.edgeApplicationId] = record;
  await state.write(WAF_STATE_FILE, current);
  return record;
}
