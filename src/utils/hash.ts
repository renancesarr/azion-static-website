import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

export async function hashFileSHA256(path: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);

    stream.on('error', reject);
    hash.on('error', reject);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
  });
}
