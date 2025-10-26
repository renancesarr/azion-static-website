import * as storageTypes from '../../../../src/services/storage/types.js';

describe('storage types module', () => {
  it('não expõe utilitários em runtime', () => {
    expect(Object.keys(storageTypes)).toHaveLength(0);
  });
});
