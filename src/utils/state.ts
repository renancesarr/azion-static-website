import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';

const STATE_ROOT = '.mcp-state';

async function ensureDirectory(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}

export function statePath(...segments: string[]): string {
  return join(STATE_ROOT, ...segments);
}

export async function readStateFile<T>(relativePath: string): Promise<T | undefined> {
  const fullPath = statePath(relativePath);
  try {
    const data = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

export async function writeStateFile<T>(relativePath: string, data: T): Promise<void> {
  const fullPath = statePath(relativePath);
  await ensureDirectory(dirname(fullPath));
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}
