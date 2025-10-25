import { UploadCandidate } from '../../models/uploadCandidate.js';
import { UploadIndexEntry } from '../../models/uploadIndexEntry.js';
import { UploadReportEntry } from '../../models/uploadReportEntry.js';
import { HttpClient } from '../../core/http/HttpClient.js';
import { StateRepository } from '../../core/state/StateRepository.js';
import { Logger } from '../../core/logging/Logger.js';

export interface StorageDependencies {
  apiBase: string;
  http: HttpClient;
  state: StateRepository;
  logger: Logger;
  uploadConcurrency: () => number;
}

export interface UploadPlan {
  candidates: UploadCandidate[];
  skipped: UploadReportEntry[];
  nextIndexFiles: Record<string, UploadIndexEntry>;
}

export interface UploadBatchResult {
  uploaded: UploadReportEntry[];
  failed: UploadReportEntry[];
}
