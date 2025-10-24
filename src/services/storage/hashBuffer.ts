import { createHash } from 'node:crypto';

export function hashBufferSHA256(buffer: Buffer): string {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}
