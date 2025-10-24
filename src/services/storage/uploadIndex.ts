import { readStateFile, writeStateFile } from '../../utils/state.js';
import { UploadIndexFile } from '../../models/uploadIndexFile.js';
import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { uploadIndexRelativePath } from './paths.js';

export async function loadUploadIndex(bucket: StorageBucketRecord): Promise<UploadIndexFile> {
  const path = uploadIndexRelativePath(bucket);
  const existing = await readStateFile<UploadIndexFile>(path);
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

export async function saveUploadIndex(bucket: StorageBucketRecord, index: UploadIndexFile): Promise<void> {
  const safeIndex: UploadIndexFile = {
    bucketId: bucket.id,
    bucketName: bucket.name,
    files: index.files,
    updatedAt: new Date().toISOString(),
  };
  await writeStateFile(uploadIndexRelativePath(bucket), safeIndex);
}
