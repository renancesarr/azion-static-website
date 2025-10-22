import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { azionApiBase } from '../utils/env.js';
import { http, HttpError } from '../utils/http.js';
import { readStateFile, writeStateFile, statePath } from '../utils/state.js';
import type { EnsureResult } from '../utils/ensure.js';

const DOMAIN_STATE_FILE = 'edge/domains.json';

const createDomainSchema = z.object({
  name: z.string().min(3).max(255).regex(/^[a-z0-9.-]+$/i),
  edgeApplicationId: z.string().min(1),
  isActive: z.boolean().default(true),
  cname: z.string().optional(),
});

const dnsInstructionsSchema = z.object({
  domainName: z.string().min(3).max(255),
  edgeApplicationId: z.string().min(1).optional(),
});

export const createDomainInputSchema = createDomainSchema;
export const dnsInstructionsInputSchema = dnsInstructionsSchema;

export type CreateDomainInput = z.infer<typeof createDomainSchema>;
type DnsInstructionsInput = z.infer<typeof dnsInstructionsSchema>;

interface ToolResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolExecutionContext {
  sessionId?: string;
}

export interface DomainRecord {
  id: string;
  name: string;
  edgeApplicationId: string;
  isActive: boolean;
  cname: string;
  createdAt: string;
  raw: unknown;
}

interface DomainState {
  domains: Record<string, DomainRecord>;
}

interface AzionDomainResponse {
  results?: AzionDomain;
  data?: AzionDomain;
}

interface AzionDomainListResponse {
  results?: AzionDomain[];
}

interface AzionDomain {
  id: string;
  name: string;
  cname: string;
  edge_application_id: string;
  cnames: {
    dns_name: string;
    ttl: number;
  }[];
  active: boolean;
  created_at?: string;
  [key: string]: unknown;
}

function normalizeDomainState(state?: DomainState): DomainState {
  if (!state) {
    return { domains: {} };
  }
  return { domains: state.domains ?? {} };
}

function buildDomainRecord(payload: AzionDomain): DomainRecord {
  return {
    id: payload.id,
    name: payload.name,
    edgeApplicationId: payload.edge_application_id,
    isActive: payload.active,
    cname: payload.cname,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}

async function persistDomain(record: DomainRecord): Promise<DomainRecord> {
  const current = normalizeDomainState(await readStateFile<DomainState>(DOMAIN_STATE_FILE));
  current.domains[record.name] = record;
  await writeStateFile(DOMAIN_STATE_FILE, current);
  return record;
}

async function findDomainByName(name: string): Promise<DomainRecord | undefined> {
  const current = normalizeDomainState(await readStateFile<DomainState>(DOMAIN_STATE_FILE));
  return current.domains[name];
}

export async function ensureDomain(input: CreateDomainInput): Promise<EnsureResult<DomainRecord>> {
  const cached = await findDomainByName(input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await createDomainViaApi(input);
  return { record, created: true };
}

async function createDomainViaApi(input: CreateDomainInput): Promise<DomainRecord> {
  const apiBase = azionApiBase();
  try {
    const response = await http<AzionDomainResponse>({
      method: 'POST',
      url: `${apiBase}/v4/domains`,
      body: {
        name: input.name,
        edge_application_id: input.edgeApplicationId,
        is_active: input.isActive,
        cname: input.cname,
      },
    });
    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionDomain);
    return await persistDomain(buildDomainRecord(payload));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await findDomainByNameApi(input.name);
      if (existing) {
        return await persistDomain(buildDomainRecord(existing));
      }
    }
    throw error;
  }
}

async function findDomainByNameApi(name: string): Promise<AzionDomain | undefined> {
  const apiBase = azionApiBase();
  const response = await http<AzionDomainListResponse>({
    method: 'GET',
    url: `${apiBase}/v4/domains?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((domain) => domain.name === name);
}

function buildDomainToolResponse(prefix: string, record: DomainRecord): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          `${prefix}`,
          `- Domain: ${record.name}`,
          `- ID: ${record.id}`,
          `- Edge Application: ${record.edgeApplicationId}`,
          `- CNAME: ${record.cname || 'n/d'}`,
          `- State: ${statePath(DOMAIN_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

function buildDnsInstruction(domain: AzionDomain): string[] {
  const lines: string[] = [];
  lines.push(`Instruções DNS para ${domain.name}`);
  lines.push('');
  if (domain.cnames?.length) {
    lines.push('Crie os seguintes registros CNAME:');
    for (const cname of domain.cnames) {
      lines.push(`- Host: ${domain.name} -> Target: ${cname.dns_name} (TTL ${cname.ttl}s)`);
    }
  } else {
    lines.push(`Crie um registro CNAME apontando ${domain.name} para ${domain.cname}.`);
  }
  lines.push('');
  lines.push('Após propagação, valide acesso via HTTPS.');
  return lines;
}

export function registerDomainTools(server: McpServer): void {
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

      const record = await createDomainViaApi(parsed);
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
        const apiDomain = await findDomainByNameApi(parsed.domainName);
        if (!apiDomain) {
          throw new Error(`Domain ${parsed.domainName} não encontrado (cache ou API).`);
        }
        const persisted = await persistDomain(buildDomainRecord(apiDomain));
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

      const apiDomain = await findDomainByNameApi(parsed.domainName);
      if (apiDomain) {
        await persistDomain(buildDomainRecord(apiDomain));
        return {
          content: [
            {
              type: 'text',
              text: buildDnsInstruction(apiDomain).join('\n'),
            },
            {
              type: 'text',
              text: `Estado atualizado em ${statePath(DOMAIN_STATE_FILE)}.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: buildDnsInstruction({
              id: cached.id,
              name: cached.name,
              cname: cached.cname,
              edge_application_id: cached.edgeApplicationId,
              cnames: [],
              active: cached.isActive,
              created_at: cached.createdAt,
            } as AzionDomain).join('\n'),
          },
          {
            type: 'text',
            text: `Estado offline em ${statePath(DOMAIN_STATE_FILE)}.`,
          },
        ],
      };
    },
  );
}
