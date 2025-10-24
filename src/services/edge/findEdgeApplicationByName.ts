import { readStateFile } from '../../utils/state.js';
import { EDGE_APP_STATE_FILE } from './constants.js';
import { EdgeAppState } from '../../models/edgeAppState.js';
import { EdgeApplicationRecord } from '../../models/edgeApplicationRecord.js';
import { normalizeEdgeApplicationState } from './normalizeEdgeApplicationState.js';

export async function findEdgeApplicationByName(name: string): Promise<EdgeApplicationRecord | undefined> {
  const current = normalizeEdgeApplicationState(await readStateFile<EdgeAppState>(EDGE_APP_STATE_FILE));
  return current.applications[name];
}
