import { z } from 'zod';
import {
  createEdgeApplicationSchema,
  createConnectorSchema,
  createRuleSchema,
} from '../../constants/edgeSchemas.js';

export const createEdgeApplicationInputSchema = createEdgeApplicationSchema;
export const createConnectorInputSchema = createConnectorSchema;
export const createRuleInputSchema = createRuleSchema;

export type CreateEdgeAppInput = z.infer<typeof createEdgeApplicationSchema>;
export type CreateConnectorInput = z.infer<typeof createConnectorSchema>;
export type CreateRuleInput = z.infer<typeof createRuleSchema>;
