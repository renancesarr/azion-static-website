import { UploadCandidate } from '../../models/uploadCandidate.js';
import { UploadReportEntry } from '../../models/uploadReportEntry.js';

export function buildUploadReportEntry(
  candidate: UploadCandidate,
  status: UploadReportEntry['status'],
  attempts: number,
  error?: Error,
): UploadReportEntry {
  return {
    objectPath: candidate.objectPath,
    hash: candidate.hash,
    size: candidate.size,
    status,
    attempts,
    error: error ? `${error.name}: ${error.message}` : undefined,
  };
}
