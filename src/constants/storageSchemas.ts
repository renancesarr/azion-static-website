import { z } from 'zod';

export const createBucketSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres.')
    .max(63, 'Nome deve ter no máximo 63 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens.'),
  edgeAccess: z
    .enum(['read_only', 'public', 'authenticated', 'private'])
    .default('read_only')
    .describe('Política de acesso padrão do bucket.'),
  description: z.string().max(255, 'Descrição deve ter até 255 caracteres.').optional(),
  region: z.string().optional(),
});

export const putObjectSchema = z
  .object({
    bucketId: z.string().optional(),
    bucketName: z.string().optional(),
    objectPath: z.string().min(1, 'Informe o caminho do objeto no bucket.'),
    contentBase64: z.string().min(1, 'Conteúdo base64 obrigatório.'),
    contentType: z.string().optional(),
    contentEncoding: z.string().optional(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/i, 'SHA256 deve ser hex de 64 caracteres.').optional(),
  })
  .refine((value) => value.bucketId || value.bucketName, {
    message: 'Informe bucketId ou bucketName.',
    path: ['bucketId'],
  });

export const uploadDirSchema = z
  .object({
    bucketId: z.string().optional(),
    bucketName: z.string().optional(),
    localDir: z.string().min(1, 'Informe o diretório local a ser publicado.'),
    prefix: z.string().optional(),
    concurrency: z.number().int().min(1).max(32).optional(),
    dryRun: z.boolean().default(false),
    stripGzipExtension: z.boolean().default(false),
  })
  .refine((value) => value.bucketId || value.bucketName, {
    message: 'Informe bucketId ou bucketName.',
    path: ['bucketId'],
  });
