export interface UploadReportEntry {
  objectPath: string;
  hash: string;
  size: number;
  status: 'uploaded' | 'skipped' | 'failed';
  attempts: number;
  error?: string;
}
