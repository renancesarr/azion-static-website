import { readStateFile, writeStateFile } from '../../utils/state.js';
import { EdgeApplicationRecord } from '../../models/edgeApplicationRecord.js';
import { EdgeAppState } from '../../models/edgeAppState.js';
import { EDGE_APP_STATE_FILE } from './constants.js';
import { normalizeEdgeApplicationState } from './normalizeEdgeApplicationState.js';

export async function persistEdgeApplication(record: EdgeApplicationRecord): Promise<EdgeApplicationRecord> {
  const current = normalizeEdgeApplicationState(await readStateFile<EdgeAppState>(EDGE_APP_STATE_FILE));
  current.applications[record.name] = record;
  await writeStateFile(EDGE_APP_STATE_FILE, current);
  return record;
}
