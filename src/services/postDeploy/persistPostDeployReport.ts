import { writeStateFile } from '../../utils/state.js';
import { PostDeployReport } from '../../models/entities/postDeployReport.js';
import { POST_DEPLOY_DIR } from './constants.js';

export async function persistPostDeployReport(report: PostDeployReport): Promise<string> {
  const timestamp = report.finishedAt.replace(/[:.]/g, '-');
  const relativePath = `${POST_DEPLOY_DIR}/check-${report.domain}-${timestamp}.json`;
  await writeStateFile(relativePath, report.toJSON());
  return relativePath;
}
