import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { ToolExecutionContext } from '../../models/shared/toolExecutionContext.js';
import { ToolResponse } from '../../models/shared/toolResponse.js';
import {
  stackValidateInputSchema,
  mimetypeValidationInputSchema,
  idempotencyValidationInputSchema,
  uploadLogInspectInputSchema,
  bucketConflictInputSchema,
  domainConflictInputSchema,
} from './schemas.js';
import { runStackValidation } from './runStackValidation.js';
import { validateMimetypes } from './validateMimetypes.js';
import { validateUploadIdempotency } from './validateUploadIdempotency.js';
import { inspectUploadLogs } from './inspectUploadLogs.js';
import { checkBucketConflict } from './checkBucketConflict.js';
import { checkDomainConflict } from './checkDomainConflict.js';
import { defaultValidationDependencies } from './dependencies.js';
import type { ValidationDependencies } from './types.js';

export function registerValidationServices(server: McpServer): void {
  const deps: ValidationDependencies = defaultValidationDependencies;

  server.registerTool(
    'azion.validate_stack',
    {
      title: 'Validar provisionamento completo',
      description: 'Confere presença dos artefatos em .mcp-state/ e testa acesso HTTP ao domínio.',
      inputSchema: stackValidateInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const report = await runStackValidation(args, deps);

      const okChecks = report.checks.filter((c) => c.ok).length;
      const httpSummary = report.http
        ? report.http.ok
          ? `HTTP ${report.http.status} em ${report.http.durationMs.toFixed(1)}ms`
          : `HTTP falhou (${report.http.error ?? 'erro desconhecido'})`
        : 'HTTP não executado (domínio ausente)';

      const summary = [
        `Validação de stack ${report.project ?? ''}`.trim(),
        `- Checks: ${okChecks}/${report.checks.length} OK`,
        `- HTTP: ${httpSummary}`,
        `- Domínio: ${report.domain ?? 'n/d'}`,
      ];

      if (report.http?.error) {
        summary.push(`- URL: ${report.http.url}`);
      }

      summary.push('', 'Detalhes:');
      for (const check of report.checks) {
        summary.push(`- ${check.name}: ${check.ok ? 'OK' : 'FALHA'} (${check.detail})`);
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

  server.registerTool(
    'azion.validate_mimetypes',
    {
      title: 'Verificar mimetypes de uploads',
      description: 'Confere se os objetos no índice de upload possuem Content-Type esperado por extensão.',
      inputSchema: mimetypeValidationInputSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const input = mimetypeValidationInputSchema.parse(args ?? {});
      const result = await validateMimetypes(input.extensions, deps);
      const summary: string[] = [
        `Extensões auditadas: ${input.extensions.join(', ')}`,
        `Objetos válidos: ${result.matches}`,
      ];
      if (result.mismatches.length > 0) {
        summary.push('', 'Inconsistências:');
        for (const mismatch of result.mismatches) {
          summary.push(`- ${mismatch.name}: ${mismatch.detail}`);
        }
      } else {
        summary.push('- Nenhum problema encontrado.');
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

  server.registerTool(
    'azion.validate_upload_idempotency',
    {
      title: 'Checar idempotência de uploads',
      description: 'Valida se o índice de uploads mantém hash único por objeto e facilita reexecução sem reenvio.',
      inputSchema: idempotencyValidationInputSchema,
    },
    async (): Promise<ToolResponse> => {
      const checks = await validateUploadIdempotency(deps);
      const summary = checks.map((check) => `- ${check.name}: ${check.ok ? 'OK' : 'FALHA'} (${check.detail})`);
      return {
        content: [
          {
            type: 'text',
            text: ['Verificação de idempotência:', ...summary].join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.inspect_upload_logs',
    {
      title: 'Resumir logs de upload',
      description: 'Lê os últimos relatórios de upload e mostra quantitativos de sucesso/falhas.',
      inputSchema: uploadLogInspectInputSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const input = uploadLogInspectInputSchema.parse(args ?? {});
      const checks = await inspectUploadLogs(input.limit);
      const summary = checks.map((check) => `- ${check.name}: ${check.detail}`);
      return {
        content: [
          {
            type: 'text',
            text: ['Últimos logs de upload:', ...summary].join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.verify_bucket_conflict',
    {
      title: 'Verificar existência de bucket',
      description: 'Confirma se um bucket já aparece em .mcp-state (indicando reuso e prevenção de 409).',
      inputSchema: bucketConflictInputSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const input = bucketConflictInputSchema.parse(args ?? {});
      const result = await checkBucketConflict(input, deps);
      return {
        content: [
          {
            type: 'text',
            text: `${result.name}: ${result.ok ? 'OK' : 'NÃO ENCONTRADO'} (${result.detail})`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.verify_domain_conflict',
    {
      title: 'Verificar existência de domain',
      description: 'Confirma se domínio já está registrado em .mcp-state para prevenir 409.',
      inputSchema: domainConflictInputSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const input = domainConflictInputSchema.parse(args ?? {});
      const result = await checkDomainConflict(input, deps);
      return {
        content: [
          {
            type: 'text',
            text: `${result.name}: ${result.ok ? 'OK' : 'NÃO ENCONTRADO'} (${result.detail})`,
          },
        ],
      };
    },
  );
}
