import { jest } from '@jest/globals';
import { findBucketByNameApi } from '../../../../src/services/storage/findBucketByNameApi.js';
import { HttpError } from '../../../../src/utils/http.js';

describe('findBucketByNameApi', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    deps.http.request.mockReset();
  });

  it('retorna bucket correspondente pelo nome', async () => {
    const payload = { id: 'bucket-1', name: 'assets' };
    deps.http.request.mockResolvedValue({ data: { results: [payload] } });

    const result = await findBucketByNameApi('assets', deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/storage/buckets?name=assets',
    });
    expect(result).toEqual(payload);
  });

  it('retorna undefined quando bucket não existe', async () => {
    deps.http.request.mockResolvedValue({ data: { results: [] } });
    const result = await findBucketByNameApi('missing', deps);
    expect(result).toBeUndefined();
  });

  it('retorna undefined quando API responde 404', async () => {
    deps.http.request.mockRejectedValue(new HttpError('404', 404, 'Not Found', null, { method: 'GET', url: 'x' }));
    const result = await findBucketByNameApi('missing', deps);
    expect(result).toBeUndefined();
  });
});
