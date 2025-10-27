import { writeStateFile } from '../../utils/state.js';
import { OrchestrationReport } from '../../models/entities/orchestrationReport.js';
import { ORCHESTRATION_STATE_DIR } from './constants.js';

export async function persistReport(report: OrchestrationReport): Promise<string> {
  const timestamp = report.finishedAt.replace(/[:.]/g, '-');
  const relativePath = `${ORCHESTRATION_STATE_DIR}/provision-${timestamp}.json`;
  await writeStateFile(relativePath, report.toJSON());
  return relativePath;
}
