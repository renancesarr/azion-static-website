import { readStateFile, writeStateFile } from '../../utils/state.js';
import { EdgeRuleRecord } from '../../models/edgeRuleRecord.js';
import { EdgeRuleState } from '../../models/edgeRuleState.js';
import { EDGE_RULE_STATE_FILE } from './constants.js';
import { normalizeRuleState } from './normalizeRuleState.js';

export async function persistRule(record: EdgeRuleRecord): Promise<EdgeRuleRecord> {
  const current = normalizeRuleState(await readStateFile<EdgeRuleState>(EDGE_RULE_STATE_FILE));
  current.rules[record.id] = record;
  await writeStateFile(EDGE_RULE_STATE_FILE, current);
  return record;
}
