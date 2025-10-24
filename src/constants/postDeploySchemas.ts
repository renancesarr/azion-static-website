import { z } from 'zod';

export const pathCheckSchema = z.object({
  path: z.string().startsWith('/'),
  expectedStatus: z.number().int().min(100).max(599).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  bodyIncludes: z.array(z.string()).optional(),
});

export const postDeployCheckSchema = z.object({
  domain: z.string().min(3).describe('Domínio público já apontado para a Azion.'),
  protocol: z.enum(['https', 'http']).default('https'),
  paths: z.array(z.union([z.string().startsWith('/'), pathCheckSchema])).default(['/']),
  expectedStatus: z.number().int().min(100).max(599).default(200),
  timeoutMs: z.number().int().min(500).max(30000).default(5000),
  headers: z.record(z.string(), z.string()).default({}),
  assertions: z
    .object({
      headers: z.record(z.string(), z.string()).optional(),
      bodyIncludes: z.array(z.string()).optional(),
    })
    .optional(),
});
