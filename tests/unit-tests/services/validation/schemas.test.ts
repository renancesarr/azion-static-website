import {
  stackValidateInputSchema,
  mimetypeValidationInputSchema,
  idempotencyValidationInputSchema,
  uploadLogInspectInputSchema,
  bucketConflictInputSchema,
  domainConflictInputSchema,
} from '../../../../src/services/validation/schemas.js';

describe('validation schemas', () => {
  it('valida stack validate com defaults', () => {
    const parsed = stackValidateInputSchema.parse({});
    expect(parsed.protocol).toBe('https');
    expect(parsed.path).toBe('/');
    expect(parsed.timeoutMs).toBe(5000);
  });

  it('define extensões padrão para validação de mimetype', () => {
    const parsed = mimetypeValidationInputSchema.parse({});
    expect(parsed.extensions.length).toBeGreaterThan(0);
  });

  it('aceita schema vazio de idempotência', () => {
    expect(idempotencyValidationInputSchema.parse({})).toEqual({});
  });

  it('valida limite de inspeção de logs com default', () => {
    const parsed = uploadLogInspectInputSchema.parse({});
    expect(parsed.limit).toBe(5);
  });

  it('valida conflitos de bucket e domain', () => {
    expect(bucketConflictInputSchema.parse({ bucketName: 'bucket' }).bucketName).toBe('bucket');
    expect(domainConflictInputSchema.parse({ domainName: 'example.com' }).domainName).toBe('example.com');
  });
});
