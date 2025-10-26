import * as storageIndex from '../../../../src/services/storage/index.js';

describe('storage index exports', () => {
  it('expõe API pública esperada', () => {
    expect(typeof storageIndex.registerStorageServices).toBe('function');
    expect(typeof storageIndex.ensureBucket).toBe('function');
    expect(typeof storageIndex.processUploadDir).toBe('function');
    expect(storageIndex.createBucketInputSchema).toBeDefined();
    expect(storageIndex.putObjectInputSchema).toBeDefined();
    expect(storageIndex.uploadDirInputSchema).toBeDefined();
    expect(storageIndex.defaultStorageDependencies).toBeDefined();
    expect(typeof storageIndex.resolveBucketReference).toBe('function');
  });
});
