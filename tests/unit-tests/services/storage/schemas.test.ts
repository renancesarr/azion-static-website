import {
  createBucketInputSchema,
  putObjectInputSchema,
  uploadDirInputSchema,
} from '../../../../src/services/storage/schemas.js';

describe('storage schemas', () => {
  it('valida criação de bucket com padrões definidos', () => {
    const parsed = createBucketInputSchema.parse({
      name: 'static-assets',
    });

    expect(parsed).toEqual({
      name: 'static-assets',
      edgeAccess: 'read_only',
    });
  });

  it('exige identificador de bucket no put_object', () => {
    const parsed = putObjectInputSchema.parse({
      bucketName: 'static-assets',
      objectPath: 'index.html',
      contentBase64: Buffer.from('hello').toString('base64'),
    });

    expect(parsed.bucketName).toBe('static-assets');
  });

  it('aplica defaults ao upload de diretório', () => {
    const parsed = uploadDirInputSchema.parse({
      bucketId: 'bucket-1',
      localDir: './dist',
    });

    expect(parsed).toMatchObject({
      bucketId: 'bucket-1',
      dryRun: false,
      stripGzipExtension: false,
    });
  });
});
