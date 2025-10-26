import { buildObjectUrl } from '../../../../src/services/storage/buildObjectUrl.js';

describe('buildObjectUrl', () => {
  it('codifica segmentos do caminho', () => {
    const url = buildObjectUrl('https://api.azion.com', 'bucket id', 'dir/arquivo atual.txt');
    expect(url).toBe('https://api.azion.com/v4/storage/buckets/bucket%20id/objects/dir/arquivo%20atual.txt');
  });
});
