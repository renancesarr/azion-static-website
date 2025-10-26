import { jest } from '@jest/globals';

const persistConnectorMock = jest.fn();
const buildConnectorRecordMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/edge/persistConnector.js', () => ({
  persistConnector: persistConnectorMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/buildConnectorRecord.js', () => ({
  buildConnectorRecord: buildConnectorRecordMock,
}));

let createConnectorViaApi: typeof import('../../../../src/services/edge/createConnectorViaApi.js')['createConnectorViaApi'];

beforeAll(async () => {
  ({ createConnectorViaApi } = await import('../../../../src/services/edge/createConnectorViaApi.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createConnectorViaApi', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
    state: {},
  } as any;

  it('envia requisição e persiste connector', async () => {
    deps.http.request.mockResolvedValue({ data: { results: { id: 'conn-1' } } });
    buildConnectorRecordMock.mockReturnValue({ id: 'conn-1', name: 'connector' });
    persistConnectorMock.mockResolvedValue({ id: 'conn-1', name: 'connector' });

    const result = await createConnectorViaApi(
      { name: 'connector', bucketId: 'bucket-1', originPath: '/' } as any,
      deps,
    );

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.azion.com/v4/edge_applications/connectors',
      body: expect.objectContaining({ name: 'connector', origin_id: 'bucket-1' }),
    });
    expect(result).toEqual({ id: 'conn-1', name: 'connector' });
  });
});
