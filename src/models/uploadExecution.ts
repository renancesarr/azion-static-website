import { UploadRunReport } from './uploadRunReport.js';

export interface UploadExecution {
  report: UploadRunReport;
  summaryLines: string[];
  logFilePath?: string;
}
