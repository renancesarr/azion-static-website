import type { UploadIndexFileData } from '../../models/shared/uploadIndexFileData.js';
import { UploadIndexFile } from '../../models/entities/uploadIndexFile.js';
import { StorageBucketRecord } from '../../models/entities/storageBucketRecord.js';
import { uploadIndexRelativePath } from './paths.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function loadUploadIndex(state: StateRepository, bucket: StorageBucketRecord): Promise<UploadIndexFile> {
  const path = uploadIndexRelativePath(bucket);
  const existing = await state.read<UploadIndexFileData>(path);
  if (existing && existing.bucketId === bucket.id) {
    return UploadIndexFile.hydrate(existing);
  }

  return UploadIndexFile.create({
    bucketId: bucket.id,
    bucketName: bucket.name,
    files: existing?.files ?? {},
    updatedAt: new Date().toISOString(),
  });
}

export async function saveUploadIndex(state: StateRepository, bucket: StorageBucketRecord, index: UploadIndexFile): Promise<void> {
  const safeIndex = UploadIndexFile.create({
    bucketId: bucket.id,
    bucketName: bucket.name,
    files: index.files,
    updatedAt: new Date().toISOString(),
  });
  await state.write(uploadIndexRelativePath(bucket), safeIndex.toJSON());
}
