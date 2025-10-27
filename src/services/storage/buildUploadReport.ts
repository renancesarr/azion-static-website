import { StorageBucketRecord } from '../../models/entities/storageBucketRecord.js';
import { UploadRunReport } from '../../models/shared/uploadRunReportData.js';
import { UploadReportEntry } from '../../models/shared/uploadReportEntryData.js';
import { UploadDirInput } from './schemas.js';

export function buildUploadReport(
  bucket: StorageBucketRecord,
  skipped: UploadReportEntry[],
  uploaded: UploadReportEntry[],
  failed: UploadReportEntry[],
  plannedUploads: number,
  scanned: number,
  input: UploadDirInput,
  startedAt: Date,
  finishedAt: Date,
): UploadRunReport {
  return {
    bucketId: bucket.id,
    bucketName: bucket.name,
    prefix: input.prefix,
    dryRun: input.dryRun,
    totals: {
      scanned,
      skipped: skipped.length,
      toUpload: plannedUploads,
      uploaded: uploaded.length,
      failed: failed.length,
    },
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    entries: [...skipped, ...uploaded, ...failed],
  };
}
