import { buildDomainRecord } from '../../../../src/services/domain/buildDomainRecord.js';

describe('buildDomainRecord', () => {
  it('mapeia payload Azion para DomainRecord', () => {
    const now = new Date().toISOString();
    const record = buildDomainRecord({
      id: 'dom-1',
      name: 'site.example.com',
      edge_application_id: 'edge-1',
      active: true,
      cname: 'site.example.com.azioncdn.net',
      cnames: [],
      created_at: now,
    });

    expect(record).toEqual({
      id: 'dom-1',
      name: 'site.example.com',
      edgeApplicationId: 'edge-1',
      isActive: true,
      cname: 'site.example.com.azioncdn.net',
      createdAt: now,
      raw: expect.objectContaining({ id: 'dom-1' }),
    });
  });

  it('define createdAt atual quando payload não informar valor', () => {
    const record = buildDomainRecord({
      id: 'dom-2',
      name: 'site2.example.com',
      edge_application_id: 'edge-2',
      active: false,
      cname: 'site2.example.com.azioncdn.net',
      cnames: [],
      created_at: undefined,
    });

    expect(typeof record.createdAt).toBe('string');
  });
});
