import { jest } from '@jest/globals';
import { StorageBucketRecord } from '../../../../src/models/entities/storageBucketRecord.js';

const statePathMock = jest.fn((value: string) => `/state/${value}`);

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  statePath: statePathMock,
}));

let buildBucketToolResponse: typeof import('../../../../src/services/storage/buildBucketToolResponse.js')['buildBucketToolResponse'];

beforeAll(async () => {
  ({ buildBucketToolResponse } = await import('../../../../src/services/storage/buildBucketToolResponse.js'));
});

describe('buildBucketToolResponse', () => {
  it('compõe mensagem com dados do bucket', () => {
    const record = StorageBucketRecord.create({
      id: 'bucket-1',
      name: 'assets',
      createdAt: '2024-01-01T00:00:00Z',
      raw: {},
    });
    const response = buildBucketToolResponse('Bucket criado.', record);

    expect(response.content[0].text).toContain('Bucket criado.');
    expect(response.content[0].text).toContain('- Bucket: assets');
    expect(response.content[0].text).toContain('/state/storage/storage_buckets.json');
    expect(statePathMock).toHaveBeenCalledWith('storage/storage_buckets.json');
  });
});
