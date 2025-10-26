import { jest } from '@jest/globals';
import { fetchBucketByIdApi } from '../../../../src/services/storage/fetchBucketByIdApi.js';
import { HttpError } from '../../../../src/utils/http.js';

describe('fetchBucketByIdApi', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    deps.http.request.mockReset();
  });

  it('retorna payload quando API responde sucesso', async () => {
    const payload = { id: 'bucket-1', name: 'assets' };
    deps.http.request.mockResolvedValue({ data: { results: payload } });

    const result = await fetchBucketByIdApi('bucket-1', deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/storage/buckets/bucket-1',
    });
    expect(result).toEqual(payload);
  });

  it('retorna undefined quando API responde 404', async () => {
    deps.http.request.mockRejectedValue(new HttpError('404', 404, 'Not Found', null, { method: 'GET', url: 'x' }));

    const result = await fetchBucketByIdApi('missing', deps);

    expect(result).toBeUndefined();
  });

  it('propaga erros diferentes de 404', async () => {
    const error = new HttpError('boom', 500, 'Internal', null, { method: 'GET', url: 'x' });
    deps.http.request.mockRejectedValue(error);

    await expect(fetchBucketByIdApi('bucket', deps)).rejects.toBe(error);
  });
});
