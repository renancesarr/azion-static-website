import * as validationTypes from '../../../../src/services/validation/types.js';

describe('validation types module', () => {
  it('não expõe exports em runtime', () => {
    expect(Object.keys(validationTypes)).toHaveLength(0);
  });
});
