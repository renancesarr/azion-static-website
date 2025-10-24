import { z } from 'zod';

export const stackValidateSchema = z.object({
  project: z.string().optional(),
  domain: z.string().optional(),
  protocol: z.enum(['https', 'http']).default('https'),
  path: z.string().default('/'),
  timeoutMs: z.number().int().min(500).max(30000).default(5000),
});

export const mimetypeValidationSchema = z.object({
  extensions: z.array(z.string().startsWith('.')).default(['.html', '.css', '.js', '.svg', '.png', '.webp', '.json', '.map']),
});

export const idempotencyValidationSchema = z.object({});

export const uploadLogInspectSchema = z.object({
  limit: z.number().int().min(1).max(50).default(5),
});

export const bucketConflictSchema = z.object({
  bucketName: z.string().min(1),
});

export const domainConflictSchema = z.object({
  domainName: z.string().min(1),
});
