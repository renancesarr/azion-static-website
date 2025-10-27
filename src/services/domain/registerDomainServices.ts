import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { createDomainSchema, dnsInstructionsSchema } from '../../constants/domainSchemas.js';
import { ToolExecutionContext } from '../../models/shared/toolExecutionContext.js';
import { ToolResponse } from '../../models/shared/toolResponse.js';
import type { AzionDomain } from '../../models/dto/azionDomain.js';
import { DomainRecord } from '../../models/entities/domainRecord.js';
import { buildDomainToolResponse } from './buildDomainToolResponse.js';
import { findDomainByName } from './findDomainByName.js';
import { createDomainViaApi } from './createDomainViaApi.js';
import { persistDomain } from './persistDomain.js';
import { findDomainByNameApi } from './findDomainByNameApi.js';
import { buildDnsInstruction } from './buildDnsInstruction.js';
import { defaultDomainDependencies } from './dependencies.js';
import type { DomainDependencies } from './types.js';
import { statePath } from '../../utils/state.js';
import { DOMAIN_STATE_FILE } from './constants.js';

export function registerDomainServices(
  server: McpServer,
  deps: DomainDependencies = defaultDomainDependencies,
): void {
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

      const cached = await findDomainByName(parsed.name);
      if (cached) {
        await server.sendLoggingMessage(
          {
            level: 'info',
            data: `Domain ${parsed.name} reaproveitado do cache.`,
          },
          sessionId,
        );
        return buildDomainToolResponse('Domain reutilizado de .mcp-state.', cached);
      }

      const record = await createDomainViaApi(parsed, deps);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: `Domain ${record.name} criado na Azion.`,
        },
        sessionId,
      );
      return buildDomainToolResponse('Domain criado com sucesso.', record);
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

      const cached = await findDomainByName(parsed.domainName);
      if (!cached) {
        const apiDomain = await findDomainByNameApi(parsed.domainName, deps);
        if (!apiDomain) {
          throw new Error(`Domain ${parsed.domainName} não encontrado (cache ou API).`);
        }
        const record = DomainRecord.fromAzionPayload(apiDomain);
        await persistDomain(record);
        return {
          content: [
            {
              type: 'text',
              text: buildDnsInstruction(apiDomain).join('\n'),
            },
            {
              type: 'text',
              text: `Estado sincronizado em ${statePath(DOMAIN_STATE_FILE)}.`,
            },
          ],
        };
      }

      const apiDomain = await findDomainByNameApi(parsed.domainName, deps);
      if (apiDomain) {
        const record = DomainRecord.fromAzionPayload(apiDomain);
        await persistDomain(record);
        return {
          content: [
            {
              type: 'text',
              text: buildDnsInstruction(apiDomain).join('\n'),
            },
          ],
        };
      }

      const payloadFromRecord: AzionDomain = cached.toAzionPayload();

      return {
        content: [
          {
            type: 'text',
            text: buildDnsInstruction(payloadFromRecord).join('\n'),
          },
        ],
      };
    },
  );
}
