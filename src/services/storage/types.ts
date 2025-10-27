import { UploadCandidate } from '../../models/shared/uploadCandidateData.js';
import { UploadIndexEntry } from '../../models/shared/uploadIndexEntryData.js';
import { UploadReportEntry } from '../../models/shared/uploadReportEntryData.js';
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
