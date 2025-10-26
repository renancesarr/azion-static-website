import * as securityTypes from '../../../../src/services/security/types.js';

describe('security types module', () => {
  it('não expõe artefatos em runtime', () => {
    expect(Object.keys(securityTypes)).toHaveLength(0);
  });
});
