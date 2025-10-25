import { UploadIndexFile } from '../../models/uploadIndexFile.js';
import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { uploadIndexRelativePath } from './paths.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function loadUploadIndex(state: StateRepository, bucket: StorageBucketRecord): Promise<UploadIndexFile> {
  const path = uploadIndexRelativePath(bucket);
  const existing = await state.read<UploadIndexFile>(path);
  if (existing && existing.bucketId === bucket.id) {
    return existing;
  }
  return {
    bucketId: bucket.id,
    bucketName: bucket.name,
    files: existing?.files ?? {},
    updatedAt: new Date().toISOString(),
  };
}

export async function saveUploadIndex(state: StateRepository, bucket: StorageBucketRecord, index: UploadIndexFile): Promise<void> {
  const safeIndex: UploadIndexFile = {
    bucketId: bucket.id,
    bucketName: bucket.name,
    files: index.files,
    updatedAt: new Date().toISOString(),
  };
  await state.write(uploadIndexRelativePath(bucket), safeIndex);
}
