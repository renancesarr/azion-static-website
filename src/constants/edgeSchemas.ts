import { z } from 'zod';

export const createEdgeApplicationSchema = z.object({
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

export const createConnectorSchema = z
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

export const createRuleSchema = z.object({
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
