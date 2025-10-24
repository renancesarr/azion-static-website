import { summarizeState, readState } from './stateUtils.js';
import { STACK_STATE } from './constants.js';
import { type BucketConflictInput } from './schemas.js';

export async function checkBucketConflict(input: BucketConflictInput) {
  const state = await readState<{ buckets: Record<string, { id: string }> }>(STACK_STATE.bucket);
  const match = state?.buckets?.[input.bucketName];
  return summarizeState(
    'Bucket existente',
    !!match,
    match ? `Bucket presente (id=${match.id}). Reexecuções usarão recurso existente.` : 'Bucket não encontrado em cache local.',
  );
}
