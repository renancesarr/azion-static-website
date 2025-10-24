import { UploadIndexFile } from '../../models/uploadIndexFile.js';
import { STACK_STATE } from './constants.js';
import { readState } from './stateUtils.js';
import { StateRepository } from '../../core/state/StateRepository.js';

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function loadFirstUploadIndex(state: StateRepository): Promise<
  { bucketId: string; file: UploadIndexFile; path: string } | undefined
> {
  const bucketState = await readState<{ buckets: Record<string, { id: string }> }>(state, STACK_STATE.bucket);
  const ids = bucketState ? Object.values(bucketState.buckets ?? {}).map((b) => b.id) : [];
  if (ids.length === 0) {
    return undefined;
  }

  const relativePath = `storage/uploads/index-${sanitize(ids[0])}.json`;
  const index = await readState<UploadIndexFile>(state, relativePath);
  if (!index) {
    return undefined;
  }

  return { bucketId: ids[0], file: index, path: relativePath };
}
