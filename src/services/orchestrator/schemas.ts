import {
  orchestrateSchema,
  connectorOrchestratorSchema,
  cacheRuleOrchestratorSchema,
  uploadConfigSchema,
} from '../../constants/orchestratorSchemas.js';
import type {
  OrchestrateInput as OrchestrateInputDto,
  ConnectorConfig as ConnectorConfigDto,
  CacheRuleConfig as CacheRuleConfigDto,
  UploadConfig as UploadConfigDto,
} from '../../models/dto/orchestrateInput.js';

export const orchestrateInputSchema = orchestrateSchema;
export const connectorConfigSchema = connectorOrchestratorSchema;
export const cacheRuleConfigSchema = cacheRuleOrchestratorSchema;
export const uploadConfigInputSchema = uploadConfigSchema;

export type OrchestrateInput = OrchestrateInputDto;
export type ConnectorConfig = ConnectorConfigDto;
export type CacheRuleConfig = CacheRuleConfigDto;
export type UploadConfigInput = UploadConfigDto;
