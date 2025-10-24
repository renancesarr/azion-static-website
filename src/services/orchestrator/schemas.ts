import {
  orchestrateSchema,
  connectorOrchestratorSchema,
  cacheRuleOrchestratorSchema,
  uploadConfigSchema,
} from '../../constants/orchestratorSchemas.js';

export const orchestrateInputSchema = orchestrateSchema;
export const connectorConfigSchema = connectorOrchestratorSchema;
export const cacheRuleConfigSchema = cacheRuleOrchestratorSchema;
export const uploadConfigInputSchema = uploadConfigSchema;

export type OrchestrateInput = typeof orchestrateSchema._type;
export type ConnectorConfig = typeof connectorOrchestratorSchema._type;
export type CacheRuleConfig = typeof cacheRuleOrchestratorSchema._type;
