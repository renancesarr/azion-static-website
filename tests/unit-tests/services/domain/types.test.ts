import * as domainTypes from '../../../../src/services/domain/types.js';

describe('domain types module', () => {
  it('carrega módulo de tipos sem runtime exports', () => {
    expect(domainTypes).toEqual({});
  });
});
