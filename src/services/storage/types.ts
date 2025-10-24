import type { HttpRequestOptions, HttpSuccess } from '../../utils/http.js';
import { UploadCandidate } from '../../models/uploadCandidate.js';
import { UploadIndexEntry } from '../../models/uploadIndexEntry.js';
import { UploadReportEntry } from '../../models/uploadReportEntry.js';

export type HttpFn = <T>(options: HttpRequestOptions) => Promise<HttpSuccess<T>>;

export interface StorageDependencies {
  apiBase: string;
  http: HttpFn;
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
