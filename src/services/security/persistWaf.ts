import { readStateFile, writeStateFile } from '../../utils/state.js';
import { WafPolicyRecord } from '../../models/wafPolicyRecord.js';
import { WafState } from '../../models/wafState.js';
import { WAF_STATE_FILE } from './constants.js';
import { normalizeWafState } from './normalizeWafState.js';

export async function persistWaf(record: WafPolicyRecord): Promise<WafPolicyRecord> {
  const current = normalizeWafState(await readStateFile<WafState>(WAF_STATE_FILE));
  current.policies[record.edgeApplicationId] = record;
  await writeStateFile(WAF_STATE_FILE, current);
  return record;
}
