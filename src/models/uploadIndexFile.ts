import { UploadIndexEntry } from './uploadIndexEntry.js';

export interface UploadIndexFile {
  bucketId: string;
  bucketName: string;
  files: Record<string, UploadIndexEntry>;
  updatedAt: string;
}
