import { buildDnsInstruction } from '../../../../src/services/domain/buildDnsInstruction.js';

describe('buildDnsInstruction', () => {
  it('monta instruções listando cnames explícitos', () => {
    const lines = buildDnsInstruction({
      id: '1',
      name: 'www.exemplo.com',
      cname: 'default.azioncdn.net',
      edge_application_id: 'edge-1',
      cnames: [
        { dns_name: 'cname1.azioncdn.net', ttl: 300 },
        { dns_name: 'cname2.azioncdn.net', ttl: 600 },
      ],
      active: true,
      created_at: '2024-01-01T00:00:00Z',
    });

    expect(lines[0]).toContain('www.exemplo.com');
    expect(lines).toContain('Crie os seguintes registros CNAME:');
    expect(lines).toContain('- Host: www.exemplo.com -> Target: cname1.azioncdn.net (TTL 300s)');
    expect(lines).toContain('- Host: www.exemplo.com -> Target: cname2.azioncdn.net (TTL 600s)');
  });

  it('orienta uso do cname principal quando não houver lista', () => {
    const lines = buildDnsInstruction({
      id: '2',
      name: 'app.exemplo.com',
      cname: 'custom.azioncdn.net',
      edge_application_id: 'edge-1',
      cnames: [],
      active: true,
      created_at: '2024-01-01T00:00:00Z',
    });

    expect(lines).toContain('Crie um registro CNAME apontando app.exemplo.com para custom.azioncdn.net.');
  });
});
