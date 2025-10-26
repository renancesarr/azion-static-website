import * as edgeTypes from '../../../../src/services/edge/types.js';

describe('edge types module', () => {
  it('não expõe artefatos em runtime', () => {
    expect(Object.keys(edgeTypes)).toHaveLength(0);
  });
});
