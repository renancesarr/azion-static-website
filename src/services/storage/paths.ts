import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { UPLOAD_LOG_DIR, UPLOAD_STATE_DIR } from './constants.js';

export function sanitizeFileSegment(value: string): string {
  const normalized = value.replace(/[:.]/g, '-');
  return normalized.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function uploadIndexRelativePath(bucket: Pick<StorageBucketRecord, 'id' | 'name'>): string {
  const identifier = bucket.id && bucket.id.length > 0 ? bucket.id : bucket.name;
  return `${UPLOAD_STATE_DIR}/index-${sanitizeFileSegment(identifier)}.json`;
}

export function uploadLogRelativePath(timestampIso: string): string {
  return `${UPLOAD_LOG_DIR}/upload-${sanitizeFileSegment(timestampIso)}.json`;
}
