import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { ToolExecutionContext } from '../../models/toolExecutionContext.js';
import { defaultSecurityDependencies } from './dependencies.js';
import type { SecurityDependencies } from './types.js';
import {
  configureWafInputSchema,
  createFirewallInputSchema,
  createWafRulesetInputSchema,
  applyWafRulesetInputSchema,
  wafStatusInputSchema,
} from './schemas.js';
import { ensureWaf } from './ensureWaf.js';
import { ensureFirewall } from './ensureFirewall.js';
import { ensureWafRuleset } from './ensureWafRuleset.js';
import { ensureFirewallRule } from './ensureFirewallRule.js';
import { buildWafToolResponse } from './buildWafToolResponse.js';
import { buildFirewallToolResponse } from './buildFirewallToolResponse.js';
import { buildWafRulesetToolResponse } from './buildWafRulesetToolResponse.js';
import { buildFirewallRuleToolResponse } from './buildFirewallRuleToolResponse.js';
import { fetchWafByEdgeAppApi } from './fetchWafByEdgeAppApi.js';
import { persistWaf } from './persistWaf.js';
import { buildWafRecord } from './buildWafRecord.js';
import { findWaf } from './findWaf.js';
import { HttpError } from '../../utils/http.js';

export function registerSecurityServices(
  server: McpServer,
  deps: SecurityDependencies = defaultSecurityDependencies,
): void {
  server.registerTool(
    'azion.create_firewall',
    {
      title: 'Criar Edge Firewall',
      description: 'Provisiona firewall com WAF ativo e associa domínios.',
      inputSchema: createFirewallInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}) => {
      const parsed = createFirewallInputSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const result = await ensureFirewall(parsed, deps);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created ? `Firewall ${result.record.name} criado.` : `Firewall ${result.record.name} reutilizado.`,
        },
        sessionId,
      );

      return buildFirewallToolResponse(
        result.created ? 'Firewall criado com sucesso.' : 'Firewall reutilizado do cache.',
        result.record,
      );
    },
  );

  server.registerTool(
    'azion.create_waf_ruleset',
    {
      title: 'Criar WAF Ruleset',
      description: 'Cria um ruleset WAF com modo configurável.',
      inputSchema: createWafRulesetInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}) => {
      const parsed = createWafRulesetInputSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const result = await ensureWafRuleset(parsed, deps);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created ? `Ruleset ${result.record.name} criado.` : `Ruleset ${result.record.name} reutilizado.`,
        },
        sessionId,
      );

      return buildWafRulesetToolResponse(
        result.created ? 'Ruleset criado com sucesso.' : 'Ruleset reaproveitado do cache.',
        result.record,
      );
    },
  );

  server.registerTool(
    'azion.apply_waf_ruleset',
    {
      title: 'Aplicar WAF Ruleset ao Firewall',
      description: 'Cria uma regra no firewall para executar o ruleset WAF informado.',
      inputSchema: applyWafRulesetInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}) => {
      const parsed = applyWafRulesetInputSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const result = await ensureFirewallRule(parsed, deps);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created
            ? `Ruleset ${parsed.rulesetId} aplicado ao firewall ${parsed.firewallId}.`
            : `Ruleset ${parsed.rulesetId} já estava aplicado ao firewall ${parsed.firewallId}.`,
        },
        sessionId,
      );

      return buildFirewallRuleToolResponse(
        result.created ? 'Ruleset aplicado ao firewall.' : 'Ruleset já estava aplicado, reaproveitado.',
        result.record,
      );
    },
  );

  server.registerTool(
    'azion.configure_waf',
    {
      title: 'Configurar WAF na Edge Application',
      description: 'Habilita ou atualiza a política WAF vinculada à Edge Application.',
      inputSchema: configureWafInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}) => {
      const parsed = configureWafInputSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const result = await ensureWaf(parsed, deps);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: `WAF atualizado para edgeApp=${parsed.edgeApplicationId}.`,
        },
        sessionId,
      );

      return buildWafToolResponse('WAF configurado com sucesso.', result.record);
    },
  );

  server.registerTool(
    'azion.waf_status',
    {
      title: 'Consultar status do WAF',
      description: 'Retorna estado corrente do WAF associado à Edge Application.',
      inputSchema: wafStatusInputSchema,
    },
    async (args: unknown) => {
      const parsed = wafStatusInputSchema.parse(args ?? {});

      const cached = await findWaf(parsed.edgeApplicationId);
      if (cached) {
        return buildWafToolResponse('Status WAF (cache local).', cached);
      }

      try {
        const apiPolicy = await fetchWafByEdgeAppApi(parsed.edgeApplicationId, deps);
        if (!apiPolicy) {
          throw new Error(`Nenhuma política WAF encontrada para edgeApp=${parsed.edgeApplicationId}.`);
        }
        const record = await persistWaf(buildWafRecord(apiPolicy));
        return buildWafToolResponse('Status WAF (sincronizado com API).', record);
      } catch (error: unknown) {
        if (error instanceof HttpError) {
          throw new Error(`Falha ao consultar WAF: ${error.message}`);
        }
        throw error;
      }
    },
  );
}
