import { UploadIndexEntry } from './uploadIndexEntryData.js';

export interface UploadIndexFileData {
  bucketId: string;
  bucketName: string;
  files: Record<string, UploadIndexEntry>;
  updatedAt: string;
}
