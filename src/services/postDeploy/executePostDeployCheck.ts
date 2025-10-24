import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { ToolExecutionContext } from '../../models/toolExecutionContext.js';
import { PostDeployCheckResult } from '../../models/postDeployCheckResult.js';
import { PostDeployPathEntry } from '../../models/postDeployPathEntry.js';
import { PostDeployReport } from '../../models/postDeployReport.js';
import { PostDeployCheckInput } from './schemas.js';
import { buildPathEntries } from './buildPathEntries.js';
import { calculateStats } from './calculateStats.js';
import { defaultPostDeployDependencies } from './dependencies.js';
import type { PostDeployDependencies } from './types.js';

function createAbortController(): AbortController {
  return new AbortController();
}

async function fetchBodyIfNeeded(response: Response, entry: PostDeployPathEntry): Promise<string | undefined> {
  if ((entry.bodyIncludes ?? []).length === 0) {
    return undefined;
  }
  return await response.text();
}

export async function executePostDeployCheck(
  input: PostDeployCheckInput,
  server: McpServer,
  context: ToolExecutionContext,
  deps: PostDeployDependencies = defaultPostDeployDependencies,
): Promise<PostDeployReport> {
  const { domain, protocol, expectedStatus, timeoutMs, headers } = input;
  const pathEntries = buildPathEntries(input);

  const startedAt = new Date();
  const results: PostDeployCheckResult[] = [];

  for (const entry of pathEntries) {
    const url = `${protocol}://${domain}${entry.path}`;
    const controller = createAbortController();
    const timer = deps.setTimeout(() => controller.abort(), timeoutMs);

    const start = deps.now();
    try {
      const response = await deps.fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      const durationMs = deps.now() - start;
      const issues: string[] = [];

      if (response.status !== entry.expectedStatus) {
        issues.push(`Esperado status ${entry.expectedStatus}, obtido ${response.status}`);
      }

      const expectedHeaders = entry.headers;
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

      const bodyIncludes = entry.bodyIncludes;
      if (bodyIncludes.length > 0) {
        const bodyText = await fetchBodyIfNeeded(response, entry);
        for (const snippet of bodyIncludes) {
          if (!bodyText || !bodyText.includes(snippet)) {
            issues.push(`Body não contém "${snippet}"`);
          }
        }
      }

      const ok = issues.length === 0;
      results.push({
        path: entry.path,
        status: response.status,
        ok,
        durationMs,
        error: ok ? undefined : issues[0],
        issues: ok ? undefined : issues,
      });

      await server.sendLoggingMessage(
        {
          level: ok ? 'info' : 'error',
          data: ok
            ? `${url} -> ${response.status} (${Math.round(durationMs)}ms)`
            : `${url} falhou: ${issues.join('; ')}`,
        },
        context.sessionId,
      );
    } catch (error) {
      const durationMs = deps.now() - start;
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        path: entry.path,
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
      deps.clearTimeout(timer);
    }
  }

  const finishedAt = new Date();
  const stats = calculateStats(results);

  return {
    domain,
    protocol,
    expectedStatus,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    timeoutMs,
    results,
    stats,
  };
}
