import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { writeStateFile, statePath } from '../utils/state.js';

const POST_DEPLOY_DIR = 'post-deploy/checks';

export const postDeployCheckSchema = z.object({
  domain: z.string().min(3).describe('Domínio público já apontado para a Azion.'),
  protocol: z.enum(['https', 'http']).default('https'),
  paths: z.array(z.string().startsWith('/')).default(['/']),
  expectedStatus: z.number().int().min(100).max(599).default(200),
  timeoutMs: z.number().int().min(500).max(30000).default(5000),
  headers: z.record(z.string(), z.string()).default({}),
  assertions: z
    .object({
      headers: z.record(z.string(), z.string()).optional(),
      bodyIncludes: z.array(z.string()).optional(),
    })
    .optional(),
});

export type PostDeployCheckInput = z.infer<typeof postDeployCheckSchema>;

interface ToolResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolExecutionContext {
  sessionId?: string;
}

interface CheckResult {
  path: string;
  status?: number;
  ok: boolean;
  durationMs: number;
  error?: string;
  issues?: string[];
}

interface CheckReport {
  domain: string;
  protocol: string;
  expectedStatus: number;
  startedAt: string;
  finishedAt: string;
  timeoutMs: number;
  results: CheckResult[];
  stats: {
    avgMs: number;
    minMs: number;
    maxMs: number;
    successRate: number;
  };
}

export async function executePostDeployCheck(
  input: PostDeployCheckInput,
  server: McpServer,
  context: ToolExecutionContext,
): Promise<CheckReport> {
  const { domain, protocol, paths, expectedStatus, timeoutMs, headers, assertions } = input;
  const startedAt = new Date();
  const results: CheckResult[] = [];

  for (const path of paths) {
    const url = `${protocol}://${domain}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const start = performance.now();
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      const durationMs = performance.now() - start;
      const issues: string[] = [];

      if (response.status !== expectedStatus) {
        issues.push(`Esperado status ${expectedStatus}, obtido ${response.status}`);
      }

      const expectedHeaders = assertions?.headers ?? {};
      if (Object.keys(expectedHeaders).length > 0) {
        const headerEntries: Record<string, string | null> = {};
        response.headers.forEach((value, key) => {
          headerEntries[key.toLowerCase()] = value;
        });
        for (const [key, expectedValue] of Object.entries(expectedHeaders)) {
          const actual = headerEntries[key.toLowerCase()] ?? null;
          if (!actual) {
            issues.push(`Header ${key} ausente`);
          } else if (!actual.includes(expectedValue)) {
            issues.push(`Header ${key}="${actual}" não contém "${expectedValue}"`);
          }
        }
      }

      const bodyIncludes = assertions?.bodyIncludes ?? [];
      if (bodyIncludes.length > 0) {
        const bodyText = await response.text();
        for (const snippet of bodyIncludes) {
          if (!bodyText.includes(snippet)) {
            issues.push(`Body não contém "${snippet}"`);
          }
        }
      }

      const ok = issues.length === 0;
      results.push({
        path,
        status: response.status,
        ok,
        durationMs,
        error: ok ? undefined : issues[0],
        issues: ok ? undefined : issues,
      });
      await server.sendLoggingMessage(
        {
          level: ok ? 'info' : 'error',
          data: ok ? `${url} -> ${response.status} (${Math.round(durationMs)}ms)` : `${url} falhou: ${issues.join('; ')}`,
        },
        context.sessionId,
      );
    } catch (error) {
      const durationMs = performance.now() - start;
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        path,
        ok: false,
        durationMs,
        error: message,
        issues: [message],
      });
      await server.sendLoggingMessage(
        {
          level: 'error',
          data: `${url} falhou: ${message}`,
        },
        context.sessionId,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  const finishedAt = new Date();
  const durations = results.map((r) => r.durationMs);
  const avgMs = durations.length ? durations.reduce((acc, cur) => acc + cur, 0) / durations.length : 0;
  const minMs = durations.length ? Math.min(...durations) : 0;
  const maxMs = durations.length ? Math.max(...durations) : 0;
  const successRate = results.length ? results.filter((r) => r.ok).length / results.length : 0;

  return {
    domain,
    protocol,
    expectedStatus,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    timeoutMs,
    results,
    stats: {
      avgMs,
      minMs,
      maxMs,
      successRate,
    },
  };
}

export async function persistPostDeployReport(report: CheckReport): Promise<string> {
  const timestamp = report.finishedAt.replace(/[:.]/g, '-');
  const relativePath = `${POST_DEPLOY_DIR}/check-${report.domain}-${timestamp}.json`;
  await writeStateFile(relativePath, report);
  return relativePath;
}

export function registerPostDeployTools(server: McpServer): void {
  server.registerTool(
    'azion.post_deploy_check',
    {
      title: 'Verificação pós-deploy',
      description: 'Executa GET simples contra paths críticos e registra status/latência.',
      inputSchema: postDeployCheckSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = postDeployCheckSchema.parse(args ?? {});
      const report = await executePostDeployCheck(parsed, server, extra);
      const reportPath = await persistPostDeployReport(report);

      const okCount = report.results.filter((r) => r.ok).length;
      const summary = [
        `Post-deploy check (${parsed.protocol}://${parsed.domain})`,
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
