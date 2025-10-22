import { promises as fs } from 'node:fs';
import { join, posix, sep } from 'node:path';

function toPosix(path: string): string {
  return path.split(sep).join(posix.sep);
}

export interface WalkEntry {
  absolutePath: string;
  relativePath: string;
  size: number;
  mtimeMs: number;
}

export async function walkDirectory(root: string): Promise<WalkEntry[]> {
  const entries: WalkEntry[] = [];

  async function walk(current: string): Promise<void> {
    const dirents = await fs.readdir(current, { withFileTypes: true });

    await Promise.all(
      dirents.map(async (dirent) => {
        const absolutePath = join(current, dirent.name);
        if (dirent.isDirectory()) {
          await walk(absolutePath);
          return;
        }

        if (!dirent.isFile()) {
          return;
        }

        const stats = await fs.stat(absolutePath);
        const relativePath = toPosix(absolutePath.slice(root.length + 1));
        entries.push({
          absolutePath,
          relativePath,
          size: stats.size,
          mtimeMs: stats.mtimeMs,
        });
      }),
    );
  }

  await walk(root);
  return entries.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
