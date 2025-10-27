import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { ToolExecutionContext } from '../../models/shared/toolExecutionContext.js';
import { ToolResponse } from '../../models/shared/toolResponse.js';
import { defaultPostDeployDependencies } from './dependencies.js';
import type { PostDeployDependencies } from './types.js';
import { postDeployCheckInputSchema } from './schemas.js';
import { executePostDeployCheck } from './executePostDeployCheck.js';
import { persistPostDeployReport } from './persistPostDeployReport.js';
import { buildPostDeploySummary } from './buildPostDeploySummary.js';

export function registerPostDeployServices(
  server: McpServer,
  deps: PostDeployDependencies = defaultPostDeployDependencies,
): void {
  server.registerTool(
    'azion.post_deploy_check',
    {
      title: 'Verificação pós-deploy',
      description: 'Executa GET simples contra paths críticos e registra status/latência.',
      inputSchema: postDeployCheckInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = postDeployCheckInputSchema.parse(args ?? {});
      const report = await executePostDeployCheck(parsed, server, extra, deps);
      const reportPath = await persistPostDeployReport(report);
      const summary = buildPostDeploySummary(report, reportPath);

      return {
        content: [
          {
            type: 'text',
            text: summary.join('\n'),
          },
        ],
      };
    },
  );
}
