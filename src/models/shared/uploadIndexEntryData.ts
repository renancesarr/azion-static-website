export interface UploadIndexEntry {
  hash: string;
  size: number;
  objectPath: string;
  updatedAt: string;
  contentType?: string;
  contentEncoding?: string;
  sourcePath?: string;
}
