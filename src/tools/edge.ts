import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { azionApiBase } from '../utils/env.js';
import { http, HttpError } from '../utils/http.js';
import { readStateFile, writeStateFile, statePath } from '../utils/state.js';
import type { EnsureResult } from '../utils/ensure.js';

const EDGE_APP_STATE_FILE = 'edge/edge_applications.json';
const EDGE_CONNECTOR_STATE_FILE = 'edge/edge_connectors.json';
const EDGE_RULE_STATE_FILE = 'edge/rules_engine.json';

const createEdgeApplicationSchema = z.object({
  name: z.string().min(3).max(128),
  deliveryProtocol: z.enum(['http', 'https', 'http-and-https']).default('http-and-https'),
  originProtocol: z.enum(['http', 'https']).default('https'),
  caching: z
    .object({
      browserCacheSettings: z.enum(['override', 'honor']).default('override'),
      edgeCacheSettings: z.enum(['override', 'honor']).default('override'),
      browserCacheTTL: z.number().int().min(0).default(300),
      edgeCacheTTL: z.number().int().min(0).default(300),
    })
    .default({}),
  enableWaf: z.boolean().default(true),
});

const createConnectorSchema = z
  .object({
    name: z.string().min(3).max(128),
    bucketId: z.string().optional(),
    bucketName: z.string().optional(),
    originPath: z.string().optional(),
  })
  .refine((value) => value.bucketId || value.bucketName, {
    message: 'Informe bucketId ou bucketName.',
    path: ['bucketId'],
  });

const createRuleSchema = z.object({
  edgeApplicationId: z.string(),
  phase: z.enum(['request', 'response']).default('request'),
  behaviors: z.array(
    z.object({
      name: z.string(),
      target: z.unknown().optional(),
    }),
  ),
  criteria: z.array(
    z.object({
      name: z.string(),
      arguments: z.array(z.string()).default([]),
      variable: z.string().optional(),
      operator: z.string().optional(),
      isNegated: z.boolean().optional(),
    }),
  ),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

export const createEdgeApplicationInputSchema = createEdgeApplicationSchema;
export const createConnectorInputSchema = createConnectorSchema;
export const createRuleInputSchema = createRuleSchema;

export type CreateEdgeAppInput = z.infer<typeof createEdgeApplicationSchema>;
export type CreateConnectorInput = z.infer<typeof createConnectorSchema>;
export type CreateRuleInput = z.infer<typeof createRuleSchema>;

interface ToolResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolExecutionContext {
  sessionId?: string;
}

export interface EdgeApplicationRecord {
  id: string;
  name: string;
  deliveryProtocol: string;
  originProtocol: string;
  caching: Record<string, unknown>;
  enableWaf: boolean;
  createdAt: string;
  raw: unknown;
}

export interface EdgeConnectorRecord {
  id: string;
  name: string;
  bucketId: string;
  bucketName?: string;
  originPath?: string;
  createdAt: string;
  raw: unknown;
}

export interface EdgeRuleRecord {
  id: string;
  edgeApplicationId: string;
  phase: string;
  order: number;
  createdAt: string;
  raw: unknown;
}

interface EdgeAppState {
  applications: Record<string, EdgeApplicationRecord>;
}

interface EdgeConnectorState {
  connectors: Record<string, EdgeConnectorRecord>;
}

interface EdgeRuleState {
  rules: Record<string, EdgeRuleRecord>;
}

interface AzionEdgeApplicationResponse {
  results?: AzionEdgeApplication;
  data?: AzionEdgeApplication;
}

interface AzionEdgeApplicationListResponse {
  results?: AzionEdgeApplication[];
}

interface AzionEdgeApplication {
  id: string;
  name: string;
  delivery_protocol: string;
  origin_protocol_policy: string;
  caching: Record<string, unknown>;
  active: boolean;
  waf: {
    active: boolean;
  };
  created_at?: string;
  [key: string]: unknown;
}

interface AzionConnectorResponse {
  results?: AzionConnector;
  data?: AzionConnector;
}

interface AzionConnectorListResponse {
  results?: AzionConnector[];
}

interface AzionConnector {
  id: string;
  name: string;
  origin_type: string;
  origin_id: string;
  bucket: {
    id: string;
    name?: string;
  };
  origin_path?: string;
  created_at?: string;
  [key: string]: unknown;
}

interface AzionRuleResponse {
  results?: AzionRule;
  data?: AzionRule;
}

interface AzionRuleListResponse {
  results?: AzionRule[];
}

interface AzionRule {
  id: string;
  phase: string;
  order: number;
  behaviors: unknown[];
  criteria: unknown[];
  created_at?: string;
  [key: string]: unknown;
}

function normalizeAppState(state?: EdgeAppState): EdgeAppState {
  if (!state) {
    return { applications: {} };
  }
  return { applications: state.applications ?? {} };
}

function normalizeConnectorState(state?: EdgeConnectorState): EdgeConnectorState {
  if (!state) {
    return { connectors: {} };
  }
  return { connectors: state.connectors ?? {} };
}

function normalizeRuleState(state?: EdgeRuleState): EdgeRuleState {
  if (!state) {
    return { rules: {} };
  }
  return { rules: state.rules ?? {} };
}

async function persistEdgeApplication(record: EdgeApplicationRecord): Promise<EdgeApplicationRecord> {
  const current = normalizeAppState(await readStateFile<EdgeAppState>(EDGE_APP_STATE_FILE));
  current.applications[record.name] = record;
  await writeStateFile(EDGE_APP_STATE_FILE, current);
  return record;
}

async function persistConnector(record: EdgeConnectorRecord): Promise<EdgeConnectorRecord> {
  const current = normalizeConnectorState(await readStateFile<EdgeConnectorState>(EDGE_CONNECTOR_STATE_FILE));
  current.connectors[record.name] = record;
  await writeStateFile(EDGE_CONNECTOR_STATE_FILE, current);
  return record;
}

async function persistRule(record: EdgeRuleRecord): Promise<EdgeRuleRecord> {
  const current = normalizeRuleState(await readStateFile<EdgeRuleState>(EDGE_RULE_STATE_FILE));
  current.rules[record.id] = record;
  await writeStateFile(EDGE_RULE_STATE_FILE, current);
  return record;
}

async function findEdgeAppByName(name: string): Promise<EdgeApplicationRecord | undefined> {
  const current = normalizeAppState(await readStateFile<EdgeAppState>(EDGE_APP_STATE_FILE));
  return current.applications[name];
}

export async function ensureEdgeApplication(input: CreateEdgeAppInput): Promise<EnsureResult<EdgeApplicationRecord>> {
  const cached = await findEdgeAppByName(input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await createEdgeApplicationViaApi(input);
  return { record, created: true };
}

async function findConnectorByName(name: string): Promise<EdgeConnectorRecord | undefined> {
  const current = normalizeConnectorState(await readStateFile<EdgeConnectorState>(EDGE_CONNECTOR_STATE_FILE));
  return current.connectors[name];
}

async function createEdgeApplicationViaApi(input: CreateEdgeAppInput): Promise<EdgeApplicationRecord> {
  const apiBase = azionApiBase();
  try {
    const response = await http<AzionEdgeApplicationResponse>({
      method: 'POST',
      url: `${apiBase}/v4/edge_applications`,
      body: {
        name: input.name,
        delivery_protocol: input.deliveryProtocol,
        origin_protocol_policy: input.originProtocol,
        caching: input.caching,
        waf: {
          active: input.enableWaf,
        },
      },
    });

    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionEdgeApplication);
    return await persistEdgeApplication(buildEdgeApplicationRecord(payload));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await findEdgeApplicationByNameApi(input.name);
      if (existing) {
        return await persistEdgeApplication(buildEdgeApplicationRecord(existing));
      }
    }
    throw error;
  }
}

async function findEdgeApplicationByNameApi(name: string): Promise<AzionEdgeApplication | undefined> {
  const apiBase = azionApiBase();
  const response = await http<AzionEdgeApplicationListResponse>({
    method: 'GET',
    url: `${apiBase}/v4/edge_applications?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((app) => app.name === name);
}

function buildEdgeApplicationRecord(payload: AzionEdgeApplication): EdgeApplicationRecord {
  return {
    id: payload.id,
    name: payload.name,
    deliveryProtocol: payload.delivery_protocol,
    originProtocol: payload.origin_protocol_policy,
    caching: payload.caching ?? {},
    enableWaf: payload.waf?.active ?? false,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}

async function createConnectorViaApi(input: CreateConnectorInput & { bucketId: string; bucketName?: string }): Promise<EdgeConnectorRecord> {
  const apiBase = azionApiBase();
  const response = await http<AzionConnectorResponse>({
    method: 'POST',
    url: `${apiBase}/v4/edge_applications/connectors`,
    body: {
      name: input.name,
      origin_type: 'edge_storage',
      origin_id: input.bucketId,
      origin_path: input.originPath,
    },
  });
  const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionConnector);
  return await persistConnector(buildConnectorRecord(payload, input.bucketId, input.bucketName));
}

async function findConnectorByNameApi(name: string): Promise<AzionConnector | undefined> {
  const apiBase = azionApiBase();
  const response = await http<AzionConnectorListResponse>({
    method: 'GET',
    url: `${apiBase}/v4/edge_applications/connectors?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((connector) => connector.name === name);
}

function buildConnectorRecord(payload: AzionConnector, bucketId: string, bucketName?: string): EdgeConnectorRecord {
  return {
    id: payload.id,
    name: payload.name,
    bucketId,
    bucketName: bucketName ?? payload.bucket?.name,
    originPath: payload.origin_path,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}

export async function ensureEdgeConnector(
  input: CreateConnectorInput & { bucketId: string; bucketName?: string },
): Promise<EnsureResult<EdgeConnectorRecord>> {
  const cached = await findConnectorByName(input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  try {
    const created = await createConnectorViaApi(input);
    return { record: created, created: true };
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await findConnectorByNameApi(input.name);
      if (existing) {
        const record = await persistConnector(buildConnectorRecord(existing, input.bucketId, input.bucketName));
        return { record, created: false };
      }
    }
    throw error;
  }
}

async function createRuleViaApi(input: CreateRuleInput): Promise<EdgeRuleRecord> {
  const apiBase = azionApiBase();
  const response = await http<AzionRuleResponse>({
    method: 'POST',
    url: `${apiBase}/v4/edge_applications/${encodeURIComponent(input.edgeApplicationId)}/rules_engine/${encodeURIComponent(input.phase)}/rules`,
    body: {
      name: input.description ?? 'rule-auto',
      phase: input.phase,
      order: input.order,
      behaviors: input.behaviors,
      criteria: input.criteria,
      description: input.description,
    },
  });
  const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionRule);
  return await persistRule(buildRuleRecord(payload, input.edgeApplicationId));
}

async function findRuleByOrder(appId: string, phase: string, order: number): Promise<EdgeRuleRecord | undefined> {
  const current = normalizeRuleState(await readStateFile<EdgeRuleState>(EDGE_RULE_STATE_FILE));
  return Object.values(current.rules).find((rule) => rule.edgeApplicationId === appId && rule.phase === phase && rule.order === order);
}

async function findRuleByOrderApi(appId: string, phase: string, order: number): Promise<AzionRule | undefined> {
  const apiBase = azionApiBase();
  const response = await http<AzionRuleListResponse>({
    method: 'GET',
    url: `${apiBase}/v4/edge_applications/${encodeURIComponent(appId)}/rules_engine/${encodeURIComponent(phase)}/rules`,
  });
  return response.data.results?.find((rule) => rule.order === order);
}

function buildRuleRecord(payload: AzionRule, appId: string): EdgeRuleRecord {
  return {
    id: payload.id,
    edgeApplicationId: appId,
    phase: payload.phase,
    order: payload.order,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}

export async function ensureCacheRule(input: CreateRuleInput): Promise<EnsureResult<EdgeRuleRecord>> {
  const cached = await findRuleByOrder(input.edgeApplicationId, input.phase, input.order);
  if (cached) {
    return { record: cached, created: false };
  }
  try {
    const created = await createRuleViaApi(input);
    return { record: created, created: true };
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await findRuleByOrderApi(input.edgeApplicationId, input.phase, input.order);
      if (existing) {
        const record = await persistRule(buildRuleRecord(existing, input.edgeApplicationId));
        return { record, created: false };
      }
    }
    throw error;
  }
}

export function registerEdgeTools(server: McpServer): void {
  server.registerTool(
    'azion.create_edge_application',
    {
      title: 'Criar Edge Application (estático)',
      description: 'Provisiona uma Edge Application pré-configurada para conteúdo estático.',
      inputSchema: createEdgeApplicationSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = createEdgeApplicationSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const result = await ensureEdgeApplication(parsed);
      const record = result.record;
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created
            ? `Edge Application ${record.name} criada.`
            : `Edge Application ${record.name} reutilizada a partir do estado local.`,
        },
        sessionId,
      );

      return {
        content: [
          {
            type: 'text',
            text: [
              result.created ? 'Edge Application criada com sucesso.' : 'Edge Application reaproveitada.',
              `- Name: ${record.name}`,
              `- ID: ${record.id}`,
              `- WAF: ${record.enableWaf ? 'ativo' : 'inativo'}`,
              `- State: ${statePath(EDGE_APP_STATE_FILE)}`,
            ].join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.create_edge_connector',
    {
      title: 'Criar Edge Connector (Edge Storage)',
      description: 'Associa um bucket do Edge Storage como origem para Edge Application.',
      inputSchema: createConnectorSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = createConnectorSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const cached = await findConnectorByName(parsed.name);
      if (cached) {
        await server.sendLoggingMessage(
          {
            level: 'info',
            data: `Connector ${parsed.name} reutilizado do estado.`,
          },
          sessionId,
        );
        return {
          content: [
            {
              type: 'text',
              text: [
                'Edge Connector reaproveitado.',
                `- Name: ${cached.name}`,
                `- ID: ${cached.id}`,
                `- Bucket: ${cached.bucketName ?? cached.bucketId}`,
                `- State: ${statePath(EDGE_CONNECTOR_STATE_FILE)}`,
              ].join('\n'),
            },
          ],
        };
      }

      const bucketRef = parsed.bucketId ?? parsed.bucketName;
      if (!bucketRef) {
        throw new Error('Bucket não informado.');
      }

      // Tentativa de descobrir bucketId pelo nome se necessário
      let bucketId = parsed.bucketId;
      let bucketName = parsed.bucketName;
      if (!bucketId && bucketName) {
        const storageState = await readStateFile<{ buckets: Record<string, { id: string }> }>('storage/storage_buckets.json');
        const stored = storageState?.buckets?.[bucketName];
        if (!stored) {
          throw new Error(`Bucket ${bucketName} não encontrado em cache local. Execute azion.create_bucket ou informe bucketId.`);
        }
        bucketId = stored.id;
      }

      if (!bucketId) {
        throw new Error('Não foi possível determinar o bucketId para criação do connector.');
      }

      const result = await ensureEdgeConnector({ ...parsed, bucketId, bucketName });
      const record = result.record;

      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created ? `Connector ${record.name} criado.` : `Connector ${record.name} reutilizado.`,
        },
        sessionId,
      );

      return {
        content: [
          {
            type: 'text',
            text: [
              result.created ? 'Edge Connector provisionado.' : 'Edge Connector reaproveitado.',
              `- Name: ${record.name}`,
              `- ID: ${record.id}`,
              `- Bucket: ${record.bucketName ?? record.bucketId}`,
              `- State: ${statePath(EDGE_CONNECTOR_STATE_FILE)}`,
            ].join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.create_cache_rule',
    {
      title: 'Criar regra de cache (Rules Engine)',
      description: 'Cria regra no Rules Engine da Edge Application informada.',
      inputSchema: createRuleSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = createRuleSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      try {
        const result = await ensureCacheRule(parsed);
        const record = result.record;
        await server.sendLoggingMessage(
          {
            level: 'info',
            data: result.created
              ? `Regra criada para edgeApp=${parsed.edgeApplicationId}.`
              : `Regra phase=${parsed.phase} order=${parsed.order} reaproveitada.`,
          },
          sessionId,
        );

        return {
          content: [
            {
              type: 'text',
              text: [
                result.created ? 'Regra criada com sucesso.' : 'Regra reaproveitada do cache local.',
                `- Edge App ID: ${record.edgeApplicationId}`,
                `- Rule ID: ${record.id}`,
                `- Phase: ${record.phase}`,
                `- Order: ${record.order}`,
                `- State: ${statePath(EDGE_RULE_STATE_FILE)}`,
              ].join('\n'),
            },
          ],
        };
      } catch (error) {
        if (error instanceof HttpError && error.status === 409) {
          const existing = await findRuleByOrderApi(parsed.edgeApplicationId, parsed.phase, parsed.order);
          if (existing) {
            const record = await persistRule(buildRuleRecord(existing, parsed.edgeApplicationId));
            return {
              content: [
                {
                  type: 'text',
                  text: [
                    'Regra já existia na Azion e foi sincronizada.',
                    `- Edge App ID: ${record.edgeApplicationId}`,
                    `- Rule ID: ${record.id}`,
                    `- Phase: ${record.phase}`,
                    `- Order: ${record.order}`,
                    `- State: ${statePath(EDGE_RULE_STATE_FILE)}`,
                  ].join('\n'),
                },
              ],
            };
          }
        }
        throw error;
      }
    },
  );
}
