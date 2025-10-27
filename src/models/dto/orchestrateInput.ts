import type { z } from 'zod';
import {
  orchestrateSchema,
  connectorOrchestratorSchema,
  cacheRuleOrchestratorSchema,
  uploadConfigSchema,
} from '../../constants/orchestratorSchemas.js';

export type OrchestrateInput = z.infer<typeof orchestrateSchema>;
export type ConnectorConfig = z.infer<typeof connectorOrchestratorSchema>;
export type CacheRuleConfig = z.infer<typeof cacheRuleOrchestratorSchema>;
export type UploadConfig = z.infer<typeof uploadConfigSchema>;
