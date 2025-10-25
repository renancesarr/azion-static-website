import { EdgeApplicationRecord } from '../../models/edgeApplicationRecord.js';
import { EdgeAppState } from '../../models/edgeAppState.js';
import { EDGE_APP_STATE_FILE } from './constants.js';
import { normalizeEdgeApplicationState } from './normalizeEdgeApplicationState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistEdgeApplication(
  state: StateRepository,
  record: EdgeApplicationRecord,
): Promise<EdgeApplicationRecord> {
  const current = normalizeEdgeApplicationState(await state.read<EdgeAppState>(EDGE_APP_STATE_FILE));
  current.applications[record.name] = record;
  await state.write(EDGE_APP_STATE_FILE, current);
  return record;
}
