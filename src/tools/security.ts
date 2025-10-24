import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { azionApiBase } from '../utils/env.js';
import { http, HttpError } from '../utils/http.js';
import { readStateFile, writeStateFile, statePath } from '../utils/state.js';
import type { EnsureResult } from '../utils/ensure.js';
import { ToolResponse } from '../models/toolResponse.js';
import { ToolExecutionContext } from '../models/toolExecutionContext.js';
import { WafPolicyRecord } from '../models/wafPolicyRecord.js';
import { WafState } from '../models/wafState.js';
import { FirewallRecord } from '../models/firewallRecord.js';
import { FirewallState } from '../models/firewallState.js';
import { WafRulesetRecord } from '../models/wafRulesetRecord.js';
import { WafRulesetState } from '../models/wafRulesetState.js';
import { FirewallRuleBinding } from '../models/firewallRuleBinding.js';
import { FirewallRuleState } from '../models/firewallRuleState.js';
import { DomainState } from '../models/domainState.js';
import { AzionWafResponse } from '../models/azionWafResponse.js';
import { AzionWafPolicy } from '../models/azionWafPolicy.js';
import { AzionFirewallResponse } from '../models/azionFirewallResponse.js';
import { AzionFirewallListResponse } from '../models/azionFirewallListResponse.js';
import { AzionFirewall } from '../models/azionFirewall.js';
import { AzionWafRulesetResponse } from '../models/azionWafRulesetResponse.js';
import { AzionWafRulesetListResponse } from '../models/azionWafRulesetListResponse.js';
import { AzionWafRuleset } from '../models/azionWafRuleset.js';
import { AzionFirewallRuleResponse } from '../models/azionFirewallRuleResponse.js';
import { AzionFirewallRuleListResponse } from '../models/azionFirewallRuleListResponse.js';
import { AzionFirewallRule } from '../models/azionFirewallRule.js';
import {
  configureWafSchema,
  wafStatusSchema,
  createFirewallSchema,
  createWafRulesetSchema,
  applyWafRulesetSchema,
} from '../constants/securitySchemas.js';

const WAF_STATE_FILE = 'security/waf_policies.json';
const FIREWALL_STATE_FILE = 'security/firewalls.json';
const WAF_RULESET_STATE_FILE = 'security/waf_rulesets.json';
const FIREWALL_RULE_STATE_FILE = 'security/firewall_rules.json';

export const configureWafInputSchema = configureWafSchema;

export type ConfigureWafInput = z.infer<typeof configureWafSchema>;
type WafStatusInput = z.infer<typeof wafStatusSchema>;
export type CreateFirewallInput = z.infer<typeof createFirewallSchema>;
export type CreateWafRulesetInput = z.infer<typeof createWafRulesetSchema>;
export type ApplyWafRulesetInput = z.infer<typeof applyWafRulesetSchema>;

function normalizeWafState(state?: WafState): WafState {
  if (!state) {
    return { policies: {} };
  }
  return { policies: state.policies ?? {} };
}

function normalizeFirewallState(state?: FirewallState): FirewallState {
  if (!state) {
    return { firewalls: {} };
  }
  return { firewalls: state.firewalls ?? {} };
}

function normalizeWafRulesetState(state?: WafRulesetState): WafRulesetState {
  if (!state) {
    return { rulesets: {} };
  }
  return { rulesets: state.rulesets ?? {} };
}

function normalizeFirewallRuleState(state?: FirewallRuleState): FirewallRuleState {
  if (!state) {
    return { bindings: {} };
  }
  return { bindings: state.bindings ?? {} };
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

function buildFirewallRecord(payload: AzionFirewall): FirewallRecord {
  return {
    id: payload.id,
    name: payload.name,
    domainIds: payload.domains ?? [],
    isActive: payload.is_active ?? true,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}

function buildWafRulesetRecord(payload: AzionWafRuleset): WafRulesetRecord {
  return {
    id: payload.id,
    name: payload.name,
    mode: payload.mode,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}

function buildFirewallRuleBinding(payload: AzionFirewallRule, firewallId: string, rulesetId: string): FirewallRuleBinding {
  return {
    id: payload.id,
    firewallId,
    rulesetId,
    order: payload.order,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}

async function persistWaf(record: WafPolicyRecord): Promise<WafPolicyRecord> {
  const current = normalizeWafState(await readStateFile<WafState>(WAF_STATE_FILE));
  current.policies[record.edgeApplicationId] = record;
  await writeStateFile(WAF_STATE_FILE, current);
  return record;
}

async function persistFirewall(record: FirewallRecord): Promise<FirewallRecord> {
  const current = normalizeFirewallState(await readStateFile<FirewallState>(FIREWALL_STATE_FILE));
  current.firewalls[record.name] = record;
  await writeStateFile(FIREWALL_STATE_FILE, current);
  return record;
}

async function persistWafRuleset(record: WafRulesetRecord): Promise<WafRulesetRecord> {
  const current = normalizeWafRulesetState(await readStateFile<WafRulesetState>(WAF_RULESET_STATE_FILE));
  current.rulesets[record.name] = record;
  await writeStateFile(WAF_RULESET_STATE_FILE, current);
  return record;
}

function bindingKey(firewallId: string, rulesetId: string): string {
  return `${firewallId}:${rulesetId}`;
}

async function persistFirewallRule(record: FirewallRuleBinding): Promise<FirewallRuleBinding> {
  const current = normalizeFirewallRuleState(await readStateFile<FirewallRuleState>(FIREWALL_RULE_STATE_FILE));
  current.bindings[bindingKey(record.firewallId, record.rulesetId)] = record;
  await writeStateFile(FIREWALL_RULE_STATE_FILE, current);
  return record;
}

async function findWaf(edgeApplicationId: string): Promise<WafPolicyRecord | undefined> {
  const current = normalizeWafState(await readStateFile<WafState>(WAF_STATE_FILE));
  return current.policies[edgeApplicationId];
}

async function findFirewallByName(name: string): Promise<FirewallRecord | undefined> {
  const current = normalizeFirewallState(await readStateFile<FirewallState>(FIREWALL_STATE_FILE));
  return current.firewalls[name];
}

async function findWafRulesetByName(name: string): Promise<WafRulesetRecord | undefined> {
  const current = normalizeWafRulesetState(await readStateFile<WafRulesetState>(WAF_RULESET_STATE_FILE));
  return current.rulesets[name];
}

async function findFirewallRuleBinding(firewallId: string, rulesetId: string): Promise<FirewallRuleBinding | undefined> {
  const current = normalizeFirewallRuleState(await readStateFile<FirewallRuleState>(FIREWALL_RULE_STATE_FILE));
  return current.bindings[bindingKey(firewallId, rulesetId)];
}

async function resolveDomainIds(input: CreateFirewallInput): Promise<string[]> {
  const ids = new Set<string>(input.domainIds ?? []);
  if (input.domainNames && input.domainNames.length > 0) {
    const domainState = (await readStateFile<DomainState>('edge/domains.json')) ?? { domains: {} };
    for (const name of input.domainNames) {
      const entry = domainState.domains[name];
      if (!entry) {
        throw new Error(`Domain ${name} não encontrado em cache local. Execute azion.create_domain antes.`);
      }
      ids.add(entry.id);
    }
  }
  if (ids.size === 0) {
    throw new Error('Nenhum domínio válido encontrado para o firewall.');
  }
  return Array.from(ids);
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

async function createFirewallViaApi(input: CreateFirewallInput): Promise<FirewallRecord> {
  const apiBase = azionApiBase();
  const domainIds = await resolveDomainIds(input);
  try {
    const response = await http<AzionFirewallResponse>({
      method: 'POST',
      url: `${apiBase}/v4/edge_firewall/firewalls`,
      body: {
        name: input.name,
        domains: domainIds,
        is_active: input.isActive ?? true,
        waf: {
          active: true,
        },
      },
    });
    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionFirewall);
    return await persistFirewall(buildFirewallRecord(payload));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await fetchFirewallByName(input.name);
      if (existing) {
        return await persistFirewall(buildFirewallRecord(existing));
      }
    }
    throw error;
  }
}

async function fetchFirewallByName(name: string): Promise<AzionFirewall | undefined> {
  const apiBase = azionApiBase();
  const response = await http<AzionFirewallListResponse>({
    method: 'GET',
    url: `${apiBase}/v4/edge_firewall/firewalls?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((fw) => fw.name === name);
}

async function createWafRulesetViaApi(input: CreateWafRulesetInput): Promise<WafRulesetRecord> {
  const apiBase = azionApiBase();
  try {
    const response = await http<AzionWafRulesetResponse>({
      method: 'POST',
      url: `${apiBase}/v4/waf/rulesets`,
      body: {
        name: input.name,
        mode: input.mode,
        description: input.description,
      },
    });
    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionWafRuleset);
    return await persistWafRuleset(buildWafRulesetRecord(payload));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await fetchWafRulesetByName(input.name);
      if (existing) {
        return await persistWafRuleset(buildWafRulesetRecord(existing));
      }
    }
    throw error;
  }
}

async function fetchWafRulesetByName(name: string): Promise<AzionWafRuleset | undefined> {
  const apiBase = azionApiBase();
  const response = await http<AzionWafRulesetListResponse>({
    method: 'GET',
    url: `${apiBase}/v4/waf/rulesets?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((ruleset) => ruleset.name === name);
}

async function fetchFirewallRules(firewallId: string): Promise<AzionFirewallRule[]> {
  const apiBase = azionApiBase();
  const response = await http<AzionFirewallRuleListResponse>({
    method: 'GET',
    url: `${apiBase}/v4/edge_firewall/firewalls/${encodeURIComponent(firewallId)}/rules`,
  });
  return response.data.results ?? [];
}

async function applyWafRulesetViaApi(input: ApplyWafRulesetInput): Promise<FirewallRuleBinding> {
  const apiBase = azionApiBase();
  try {
    const response = await http<AzionFirewallRuleResponse>({
      method: 'POST',
      url: `${apiBase}/v4/edge_firewall/firewalls/${encodeURIComponent(input.firewallId)}/rules`,
      body: {
        name: `waf-${input.rulesetId}`,
        order: input.order,
        is_active: true,
        behaviors: [
          {
            name: 'waf',
            target: input.rulesetId,
          },
        ],
        criteria: [
          {
            name: 'all',
            arguments: ['*'],
          },
        ],
      },
    });
    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionFirewallRule);
    return await persistFirewallRule(buildFirewallRuleBinding(payload, input.firewallId, input.rulesetId));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existingRules = await fetchFirewallRules(input.firewallId);
      const match = existingRules.find((rule) => JSON.stringify(rule.behaviors).includes(input.rulesetId));
      if (match) {
        return await persistFirewallRule(buildFirewallRuleBinding(match, input.firewallId, input.rulesetId));
      }
    }
    throw error;
  }
}

export async function ensureWaf(input: ConfigureWafInput): Promise<EnsureResult<WafPolicyRecord>> {
  const cached = await findWaf(input.edgeApplicationId);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await configureWafViaApi(input);
  return { record, created: true };
}

export async function ensureFirewall(input: CreateFirewallInput): Promise<EnsureResult<FirewallRecord>> {
  const cached = await findFirewallByName(input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await createFirewallViaApi(input);
  return { record, created: true };
}

export async function ensureWafRuleset(input: CreateWafRulesetInput): Promise<EnsureResult<WafRulesetRecord>> {
  const cached = await findWafRulesetByName(input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await createWafRulesetViaApi(input);
  return { record, created: true };
}

export async function ensureFirewallRule(input: ApplyWafRulesetInput): Promise<EnsureResult<FirewallRuleBinding>> {
  const cached = await findFirewallRuleBinding(input.firewallId, input.rulesetId);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await applyWafRulesetViaApi(input);
  return { record, created: true };
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
    'azion.create_firewall',
    {
      title: 'Criar Edge Firewall',
      description: 'Provisiona firewall com WAF ativo e associa domínios.',
      inputSchema: createFirewallSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = createFirewallSchema.parse(args ?? {});
      const result = await ensureFirewall(parsed);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created ? `Firewall ${result.record.name} criado.` : `Firewall ${result.record.name} reutilizado.`,
        },
        extra.sessionId,
      );
      return {
        content: [
          {
            type: 'text',
            text: [
              result.created ? 'Firewall criado com sucesso.' : 'Firewall reutilizado do cache.',
              `- ID: ${result.record.id}`,
              `- Domínios: ${result.record.domainIds.join(', ')}`,
              `- State: ${statePath(FIREWALL_STATE_FILE)}`,
            ].join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.create_waf_ruleset',
    {
      title: 'Criar WAF Ruleset',
      description: 'Cria um ruleset WAF com modo configurável.',
      inputSchema: createWafRulesetSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = createWafRulesetSchema.parse(args ?? {});
      const result = await ensureWafRuleset(parsed);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created ? `Ruleset ${result.record.name} criado.` : `Ruleset ${result.record.name} reutilizado.`,
        },
        extra.sessionId,
      );
      return {
        content: [
          {
            type: 'text',
            text: [
              result.created ? 'Ruleset criado com sucesso.' : 'Ruleset reaproveitado do cache.',
              `- ID: ${result.record.id}`,
              `- Mode: ${result.record.mode}`,
              `- State: ${statePath(WAF_RULESET_STATE_FILE)}`,
            ].join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.apply_waf_ruleset',
    {
      title: 'Aplicar WAF Ruleset ao Firewall',
      description: 'Cria uma regra no firewall para executar o ruleset WAF informado.',
      inputSchema: applyWafRulesetSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = applyWafRulesetSchema.parse(args ?? {});
      const result = await ensureFirewallRule(parsed);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created
            ? `Ruleset ${parsed.rulesetId} aplicado ao firewall ${parsed.firewallId}.`
            : `Ruleset ${parsed.rulesetId} já estava aplicado ao firewall ${parsed.firewallId}.`,
        },
        extra.sessionId,
      );
      return {
        content: [
          {
            type: 'text',
            text: [
              result.created ? 'Ruleset aplicado ao firewall.' : 'Ruleset já estava aplicado, reaproveitado.',
              `- Firewall ID: ${parsed.firewallId}`,
              `- Ruleset ID: ${parsed.rulesetId}`,
              `- Rule ID: ${result.record.id}`,
              `- State: ${statePath(FIREWALL_RULE_STATE_FILE)}`,
            ].join('\n'),
          },
        ],
      };
    },
  );

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
