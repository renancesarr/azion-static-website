import { UploadIndexEntry } from '../uploadIndexEntry.js';

export interface UploadIndexFileData {
  bucketId: string;
  bucketName: string;
  files: Record<string, UploadIndexEntry>;
  updatedAt: string;
}
