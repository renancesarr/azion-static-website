import { UploadIndexFile } from '../../models/uploadIndexFile.js';
import { STACK_STATE } from './constants.js';
import { readState } from './stateUtils.js';

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function loadFirstUploadIndex(): Promise<
  { bucketId: string; file: UploadIndexFile; path: string } | undefined
> {
  const bucketState = await readState<{ buckets: Record<string, { id: string }> }>(STACK_STATE.bucket);
  const ids = bucketState ? Object.values(bucketState.buckets ?? {}).map((b) => b.id) : [];
  if (ids.length === 0) {
    return undefined;
  }

  const relativePath = `storage/uploads/index-${sanitize(ids[0])}.json`;
  const index = await readState<UploadIndexFile>(relativePath);
  if (!index) {
    return undefined;
  }

  return { bucketId: ids[0], file: index, path: relativePath };
}
