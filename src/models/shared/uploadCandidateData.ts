export interface UploadCandidate {
  absolutePath: string;
  relativePath: string;
  objectPath: string;
  hash: string;
  size: number;
  contentType: string;
  contentEncoding?: string;
}
