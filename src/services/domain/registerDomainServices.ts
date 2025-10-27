import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { createDomainSchema, dnsInstructionsSchema } from '../../constants/domainSchemas.js';
import { ToolExecutionContext } from '../../models/shared/toolExecutionContext.js';
import { ToolResponse } from '../../models/shared/toolResponse.js';
import { buildDomainToolResponse } from './buildDomainToolResponse.js';
import { defaultDomainDependencies } from './dependencies.js';
import type { DomainDependencies } from './types.js';
import { statePath } from '../../utils/state.js';
import { DOMAIN_STATE_FILE } from './constants.js';
import { createDomainService } from './domainService.js';

export function registerDomainServices(
  server: McpServer,
  deps: DomainDependencies = defaultDomainDependencies,
): void {
  const service = createDomainService({ dependencies: deps });

  server.registerTool(
    'azion.create_domain',
    {
      title: 'Criar Domain Azion',
      description: 'Provisiona um Domain na Azion apontando para a Edge Application informada.',
      inputSchema: createDomainSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = createDomainSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const ensured = await service.ensureDomain(parsed);
      if (!ensured.created) {
        await server.sendLoggingMessage(
          {
            level: 'info',
            data: `Domain ${parsed.name} reaproveitado do cache.`,
          },
          sessionId,
        );
        return buildDomainToolResponse('Domain reutilizado de .mcp-state.', ensured.record);
      }

      await server.sendLoggingMessage(
        {
          level: 'info',
          data: `Domain ${ensured.record.name} criado na Azion.`,
        },
        sessionId,
      );
      return buildDomainToolResponse('Domain criado com sucesso.', ensured.record);
    },
  );

  server.registerTool(
    'azion.dns_instructions',
    {
      title: 'Gerar instruções DNS',
      description: 'Retorna instruções de configuração DNS (CNAME) para o domain informado.',
      inputSchema: dnsInstructionsSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const parsed = dnsInstructionsSchema.parse(args ?? {});

      const { instructions, stateSynced } = await service.getDnsInstructions(parsed.domainName);

      const content: ToolResponse['content'] = [
        {
          type: 'text',
          text: instructions.join('\n'),
        },
      ];

      if (stateSynced) {
        content.push({
          type: 'text',
          text: `Estado sincronizado em ${statePath(DOMAIN_STATE_FILE)}.`,
        });
      }

      return {
        content,
      };
    },
  );
}
