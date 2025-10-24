import { statePath } from '../../utils/state.js';
import { PostDeployReport } from '../../models/postDeployReport.js';

export function buildPostDeploySummary(report: PostDeployReport, reportPath: string): string[] {
  const okCount = report.results.filter((r) => r.ok).length;
  const summary = [
    `Post-deploy check (${report.protocol}://${report.domain})`,
    `- Paths analisados: ${report.results.length}`,
    `- Sucesso: ${okCount}`,
    `- Falhas: ${report.results.length - okCount}`,
    `- Latência média: ${report.stats.avgMs.toFixed(1)}ms (min ${report.stats.minMs.toFixed(1)} | max ${report.stats.maxMs.toFixed(1)})`,
    `- Sucesso (%): ${(report.stats.successRate * 100).toFixed(1)}%`,
    `- Relatório: ${statePath(reportPath)}`,
  ];

  if (okCount !== report.results.length) {
    summary.push('', 'Falhas:');
    for (const result of report.results.filter((r) => !r.ok)) {
      const issuesText = result.issues ? ` (${result.issues.join('; ')})` : '';
      summary.push(`- ${result.path}: ${result.error ?? 'inconsistência'}${issuesText}`);
    }
  }

  return summary;
}
