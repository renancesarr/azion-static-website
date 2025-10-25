import { summarizeState, readState } from './stateUtils.js';
import { STACK_STATE } from './constants.js';
import { type BucketConflictInput } from './schemas.js';
import type { ValidationDependencies } from './types.js';

export async function checkBucketConflict(
  input: BucketConflictInput,
  deps: ValidationDependencies,
) {
  const state = await readState<{ buckets: Record<string, { id: string }> }>(deps.state, STACK_STATE.bucket);
  const match = state?.buckets?.[input.bucketName];
  return summarizeState(
    'Bucket existente',
    !!match,
    match ? `Bucket presente (id=${match.id}). Reexecuções usarão recurso existente.` : 'Bucket não encontrado em cache local.',
  );
}
