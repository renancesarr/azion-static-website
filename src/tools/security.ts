import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { azionApiBase } from '../utils/env.js';
import { http, HttpError } from '../utils/http.js';
import { readStateFile, writeStateFile, statePath } from '../utils/state.js';
import type { EnsureResult } from '../utils/ensure.js';

const WAF_STATE_FILE = 'security/waf_policies.json';

const configureWafSchema = z.object({
  edgeApplicationId: z.string().min(1),
  wafId: z.string().optional(),
  enable: z.boolean().default(true),
  mode: z.enum(['learning', 'blocking']).default('blocking'),
});

const wafStatusSchema = z.object({
  edgeApplicationId: z.string().min(1),
});

export const configureWafInputSchema = configureWafSchema;

type ConfigureWafInput = z.infer<typeof configureWafSchema>;
type WafStatusInput = z.infer<typeof wafStatusSchema>;

interface ToolResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolExecutionContext {
  sessionId?: string;
}

export interface WafPolicyRecord {
  edgeApplicationId: string;
  wafId: string;
  mode: string;
  enabled: boolean;
  updatedAt: string;
  raw: unknown;
}

interface WafState {
  policies: Record<string, WafPolicyRecord>;
}

interface AzionWafResponse {
  results?: AzionWafPolicy;
  data?: AzionWafPolicy;
}

interface AzionWafPolicy {
  id: string;
  edge_application_id: string;
  mode: string;
  enabled: boolean;
  updated_at?: string;
  [key: string]: unknown;
}

function normalizeWafState(state?: WafState): WafState {
  if (!state) {
    return { policies: {} };
  }
  return { policies: state.policies ?? {} };
}

function buildWafRecord(payload: AzionWafPolicy): WafPolicyRecord {
  return {
    edgeApplicationId: payload.edge_application_id,
    wafId: payload.id,
    mode: payload.mode,
    enabled: payload.enabled,
    updatedAt: payload.updated_at ?? new Date().toISOString(),
    raw: payload,
  };
}

async function persistWaf(record: WafPolicyRecord): Promise<WafPolicyRecord> {
  const current = normalizeWafState(await readStateFile<WafState>(WAF_STATE_FILE));
  current.policies[record.edgeApplicationId] = record;
  await writeStateFile(WAF_STATE_FILE, current);
  return record;
}

async function findWaf(edgeApplicationId: string): Promise<WafPolicyRecord | undefined> {
  const current = normalizeWafState(await readStateFile<WafState>(WAF_STATE_FILE));
  return current.policies[edgeApplicationId];
}

export async function ensureWaf(input: ConfigureWafInput): Promise<EnsureResult<WafPolicyRecord>> {
  const cached = await findWaf(input.edgeApplicationId);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await configureWafViaApi(input);
  return { record, created: true };
}

async function configureWafViaApi(input: ConfigureWafInput): Promise<WafPolicyRecord> {
  const apiBase = azionApiBase();
  try {
    const response = await http<AzionWafResponse>({
      method: 'POST',
      url: `${apiBase}/v4/waf/policies`,
      body: {
        edge_application_id: input.edgeApplicationId,
        waf_id: input.wafId,
        mode: input.mode,
        enabled: input.enable,
      },
    });
    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionWafPolicy);
    return await persistWaf(buildWafRecord(payload));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await fetchWafByEdgeApp(input.edgeApplicationId);
      if (existing) {
        return await persistWaf(buildWafRecord(existing));
      }
    }
    throw error;
  }
}

async function fetchWafByEdgeApp(edgeApplicationId: string): Promise<AzionWafPolicy | undefined> {
  const apiBase = azionApiBase();
  const response = await http<{ results?: AzionWafPolicy[] }>({
    method: 'GET',
    url: `${apiBase}/v4/waf/policies?edge_application_id=${encodeURIComponent(edgeApplicationId)}`,
  });
  return response.data.results?.find((policy) => policy.edge_application_id === edgeApplicationId);
}

function buildWafToolResponse(prefix: string, record: WafPolicyRecord): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          `${prefix}`,
          `- Edge Application: ${record.edgeApplicationId}`,
          `- WAF ID: ${record.wafId}`,
          `- Mode: ${record.mode}`,
          `- Enabled: ${record.enabled}`,
          `- State: ${statePath(WAF_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

export function registerSecurityTools(server: McpServer): void {
  server.registerTool(
    'azion.configure_waf',
    {
      title: 'Configurar WAF na Edge Application',
      description: 'Habilita ou atualiza a política WAF vinculada à Edge Application.',
      inputSchema: configureWafSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = configureWafSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const record = await configureWafViaApi(parsed);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: `WAF atualizado para edgeApp=${parsed.edgeApplicationId}.`,
        },
        sessionId,
      );

      return buildWafToolResponse('WAF configurado com sucesso.', record);
    },
  );

  server.registerTool(
    'azion.waf_status',
    {
      title: 'Consultar status do WAF',
      description: 'Retorna estado corrente do WAF associado à Edge Application.',
      inputSchema: wafStatusSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const parsed = wafStatusSchema.parse(args ?? {});
      const cached = await findWaf(parsed.edgeApplicationId);
      if (cached) {
        return buildWafToolResponse('Status WAF (cache local).', cached);
      }

      const apiPolicy = await fetchWafByEdgeApp(parsed.edgeApplicationId);
      if (!apiPolicy) {
        throw new Error(`Nenhuma política WAF encontrada para edgeApp=${parsed.edgeApplicationId}.`);
      }
      const record = await persistWaf(buildWafRecord(apiPolicy));
      return buildWafToolResponse('Status WAF (sincronizado com API).', record);
    },
  );
}
