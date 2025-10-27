import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { ToolExecutionContext } from '../../models/shared/toolExecutionContext.js';
import { defaultEdgeDependencies } from './dependencies.js';
import type { EdgeDependencies } from './types.js';
import {
  createEdgeApplicationInputSchema,
  createConnectorInputSchema,
  createRuleInputSchema,
} from './schemas.js';
import { ensureEdgeApplication } from './ensureEdgeApplication.js';
import { ensureEdgeConnector } from './ensureEdgeConnector.js';
import { ensureCacheRule } from './ensureCacheRule.js';
import { buildEdgeApplicationToolResponse } from './buildEdgeApplicationToolResponse.js';
import { buildEdgeConnectorToolResponse } from './buildEdgeConnectorToolResponse.js';
import { buildEdgeRuleToolResponse } from './buildEdgeRuleToolResponse.js';
import { findConnectorByName } from './findConnectorByName.js';
import { findRuleByOrderApi } from './findRuleByOrderApi.js';
import { persistRule } from './persistRule.js';
import { buildRuleRecord } from './buildRuleRecord.js';
import { resolveConnectorBucket } from './resolveConnectorBucket.js';
import { findRuleByOrder } from './findRuleByOrder.js';
import { HttpError } from '../../utils/http.js';

export function registerEdgeServices(
  server: McpServer,
  deps: EdgeDependencies = defaultEdgeDependencies,
): void {
  server.registerTool(
    'azion.create_edge_application',
    {
      title: 'Criar Edge Application (estático)',
      description: 'Provisiona uma Edge Application pré-configurada para conteúdo estático.',
      inputSchema: createEdgeApplicationInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}) => {
      const parsed = createEdgeApplicationInputSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const result = await ensureEdgeApplication(parsed, deps);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created
            ? `Edge Application ${result.record.name} criada.`
            : `Edge Application ${result.record.name} reaproveitada do cache.`,
        },
        sessionId,
      );

      return buildEdgeApplicationToolResponse(
        result.created ? 'Edge Application criada com sucesso.' : 'Edge Application reaproveitada.',
        result.record,
      );
    },
  );

  server.registerTool(
    'azion.create_edge_connector',
    {
      title: 'Criar Edge Connector (Edge Storage)',
      description: 'Associa um bucket do Edge Storage como origem para Edge Application.',
      inputSchema: createConnectorInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}) => {
      const parsed = createConnectorInputSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const cached = await findConnectorByName(deps.state, parsed.name);
      if (cached) {
        await server.sendLoggingMessage(
          {
            level: 'info',
            data: `Connector ${parsed.name} reutilizado do estado local.`,
          },
          sessionId,
        );
        return buildEdgeConnectorToolResponse('Edge Connector reaproveitado.', cached);
      }

      const bucket = await resolveConnectorBucket({
        bucketId: parsed.bucketId,
        bucketName: parsed.bucketName,
      });

      const result = await ensureEdgeConnector(
        {
          ...parsed,
          bucketId: bucket.id,
          bucketName: bucket.name,
        },
        deps,
      );

      await server.sendLoggingMessage(
        {
          level: 'info',
          data: result.created ? `Connector ${result.record.name} criado.` : `Connector ${result.record.name} reutilizado.`,
        },
        sessionId,
      );

      return buildEdgeConnectorToolResponse(
        result.created ? 'Edge Connector provisionado.' : 'Edge Connector reaproveitado.',
        result.record,
      );
    },
  );

  server.registerTool(
    'azion.create_cache_rule',
    {
      title: 'Criar regra de cache (Rules Engine)',
      description: 'Cria regra no Rules Engine da Edge Application informada.',
      inputSchema: createRuleInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}) => {
      const parsed = createRuleInputSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      try {
        const result = await ensureCacheRule(parsed, deps);
        await server.sendLoggingMessage(
          {
            level: 'info',
            data: result.created
              ? `Regra criada para edgeApp=${parsed.edgeApplicationId}.`
              : `Regra phase=${parsed.phase} order=${parsed.order} reaproveitada.`,
          },
          sessionId,
        );

        return buildEdgeRuleToolResponse(
          result.created ? 'Regra criada com sucesso.' : 'Regra reaproveitada do cache local.',
          result.record,
        );
      } catch (error: unknown) {
        if (error instanceof HttpError && error.status === 409) {
          const existing = await findRuleByOrder(deps.state, parsed.edgeApplicationId, parsed.phase, parsed.order);
          if (existing) {
            return buildEdgeRuleToolResponse('Regra já existia no cache local.', existing);
          }
          const apiRule = await findRuleByOrderApi(parsed.edgeApplicationId, parsed.phase, parsed.order, deps);
          if (apiRule) {
            const record = await persistRule(deps.state, buildRuleRecord(apiRule, parsed.edgeApplicationId));
            return buildEdgeRuleToolResponse('Regra já existia na Azion e foi sincronizada.', record);
          }
        }
        throw error;
      }
    },
  );
}
