import { UploadReportEntry } from './uploadReportEntryData.js';

export interface UploadRunReport {
  bucketId: string;
  bucketName: string;
  prefix?: string;
  dryRun: boolean;
  totals: {
    scanned: number;
    skipped: number;
    toUpload: number;
    uploaded: number;
    failed: number;
  };
  startedAt: string;
  finishedAt: string;
  entries: UploadReportEntry[];
}
