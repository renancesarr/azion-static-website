import { UploadRunReport } from './uploadRunReportData.js';

export interface UploadExecution {
  report: UploadRunReport;
  summaryLines: string[];
  logFilePath?: string;
}
