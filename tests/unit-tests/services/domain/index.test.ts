import * as domainIndex from '../../../../src/services/domain/index.js';

describe('domain index exports', () => {
  it('exibe funções principais do módulo', () => {
    expect(typeof domainIndex.registerDomainServices).toBe('function');
    expect(typeof domainIndex.ensureDomain).toBe('function');
    expect(domainIndex.createDomainInputSchema).toBeDefined();
    expect(domainIndex.dnsInstructionsInputSchema).toBeDefined();
    expect(domainIndex.defaultDomainDependencies).toBeDefined();
  });
});
