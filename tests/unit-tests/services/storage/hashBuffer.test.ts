import { hashBufferSHA256 } from '../../../../src/services/storage/hashBuffer.js';

describe('hashBufferSHA256', () => {
  it('gera hash determinístico', () => {
    const buffer = Buffer.from('content');
    const hash = hashBufferSHA256(buffer);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashBufferSHA256(buffer)).toBe(hash);
  });
});
