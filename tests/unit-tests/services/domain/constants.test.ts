import { DOMAIN_STATE_FILE } from '../../../../src/services/domain/constants.js';

describe('domain constants', () => {
  it('define caminho padrão de estado', () => {
    expect(DOMAIN_STATE_FILE).toBe('edge/domains.json');
  });
});
