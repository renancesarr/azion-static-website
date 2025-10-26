import * as validationIndex from '../../../../src/services/validation/index.js';

describe('validation index exports', () => {
  it('expõe serviços e schemas', () => {
    expect(typeof validationIndex.registerValidationServices).toBe('function');
    expect(typeof validationIndex.runStackValidation).toBe('function');
    expect(typeof validationIndex.validateMimetypes).toBe('function');
    expect(typeof validationIndex.validateUploadIdempotency).toBe('function');
    expect(typeof validationIndex.inspectUploadLogs).toBe('function');
    expect(typeof validationIndex.checkBucketConflict).toBe('function');
    expect(typeof validationIndex.checkDomainConflict).toBe('function');
    expect(validationIndex.stackValidateInputSchema).toBeDefined();
    expect(validationIndex.defaultValidationDependencies).toBeDefined();
  });
});
