import { jest } from '@jest/globals';
import { findEdgeApplicationByNameApi } from '../../../../src/services/edge/findEdgeApplicationByNameApi.js';
import { findConnectorByNameApi } from '../../../../src/services/edge/findConnectorByNameApi.js';
import { findRuleByOrderApi } from '../../../../src/services/edge/findRuleByOrderApi.js';

describe('edge API finders', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    deps.http.request.mockReset();
  });

  it('busca edge application por nome', async () => {
    const payload = { id: 'app-1', name: 'edge-app' };
    deps.http.request.mockResolvedValue({ data: { results: [payload] } });

    const result = await findEdgeApplicationByNameApi('edge-app', deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/edge_applications?name=edge-app',
    });
    expect(result).toEqual(payload);
  });

  it('busca connector por nome', async () => {
    const payload = { id: 'conn-1', name: 'connector' };
    deps.http.request.mockResolvedValue({ data: { results: [payload] } });

    const result = await findConnectorByNameApi('connector', deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/edge_applications/connectors?name=connector',
    });
    expect(result).toEqual(payload);
  });

  it('busca regra por order', async () => {
    const payload = { id: 'rule-1', order: 1 };
    deps.http.request.mockResolvedValue({ data: { results: [payload] } });

    const result = await findRuleByOrderApi('app-1', 'request', 1, deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/edge_applications/app-1/rules_engine/request/rules',
    });
    expect(result).toEqual(payload);
  });
});
